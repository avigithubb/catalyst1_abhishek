import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PatientModel } from '../models/patientModel';
import { MedicationModel } from '../models/medicationModel';
import { query } from '../db/connection';
import { geminiService, PatientLiveContext } from '../services/geminiService';

export const ChatbotController = {
  ask: async (req: AuthRequest, res: Response) => {
    const { question, context } = req.body;
    const patientId = req.user?.patientProfileId || 'pat_101';

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    let liveContext: PatientLiveContext | undefined;

    try {
      if (req.user?.patientProfileId) {
        const pId = req.user.patientProfileId;
        const profileRes = await PatientModel.findById(pId).catch(() => null);
        const patient = profileRes?.rowCount ? profileRes.rows[0] : null;

        const todayStr = new Date().toISOString().split('T')[0];
        const medsRes = await MedicationModel.getDailyScheduleWithAdherence(pId, todayStr).catch(() => null);
        const meds = medsRes?.rows || [];

        const takenMeds = meds.filter((m: any) => m.status === 'taken').map((m: any) => `${m.name} (${m.dosage})`);
        const pendingMeds = meds.filter((m: any) => m.status !== 'taken').map((m: any) => `${m.name} (${m.dosage}) at ${m.scheduledTime}`);

        const exRes = await query(
          'SELECT title, duration_minutes, category, is_completed FROM daily_exercises WHERE patient_id = $1',
          [pId]
        ).catch(() => null);
        const exercises = exRes?.rows || [];
        const completedExercises = exercises.filter((e: any) => e.is_completed).map((e: any) => `${e.title} (${e.duration_minutes} mins)`);
        const pendingExercises = exercises.filter((e: any) => !e.is_completed).map((e: any) => `${e.title} (${e.duration_minutes} mins)`);

        liveContext = {
          patientName: patient?.full_name || 'Robert Harrison',
          age: patient?.age || 74,
          bloodPressure: patient?.blood_pressure || '124/82 mmHg',
          heartRate: patient?.heart_rate || 72,
          bloodSugar: patient?.blood_sugar || '110 mg/dL',
          streakDays: patient?.streak_days ?? 14,
          totalMedications: meds.length,
          takenMedications: takenMeds,
          pendingMedications: pendingMeds,
          completedExercises: completedExercises,
          pendingExercises: pendingExercises,
        };
      }
    } catch (dbErr) {
      console.warn('Could not load patient context from DB, proceeding without dossier:', dbErr);
    }

    // Fall back to client-provided context if not loaded from DB
    if (!liveContext && context && typeof context === 'object') {
      liveContext = {
        patientName: context.patientName || 'Patient',
        age: context.age || 70,
        bloodPressure: context.bloodPressure || '120/80 mmHg',
        heartRate: context.heartRate || 72,
        bloodSugar: context.bloodSugar || '100 mg/dL',
        streakDays: context.streakDays ?? 0,
        totalMedications: context.totalMedications || 0,
        takenMedications: Array.isArray(context.takenMedications) ? context.takenMedications : [],
        pendingMedications: Array.isArray(context.pendingMedications) ? context.pendingMedications : [],
        completedExercises: Array.isArray(context.completedExercises) ? context.completedExercises : [],
        pendingExercises: Array.isArray(context.pendingExercises) ? context.pendingExercises : [],
      };
    }

    try {
      // Send request to Gemini with guardrails
      const answer = await geminiService.chatWithDoctorBot(question.trim(), liveContext);

      return res.json({
        answer,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('ChatbotController.ask error:', error);
      return res.status(500).json({ 
        message: error.message || 'Failed to process question with healthcare AI assistant' 
      });
    }
  }
};
