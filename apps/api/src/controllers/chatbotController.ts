import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PatientModel } from '../models/patientModel';
import { MedicationModel } from '../models/medicationModel';
import { query } from '../db/connection';
import { geminiService, PatientLiveContext } from '../services/geminiService';

export const ChatbotController = {
  ask: async (req: AuthRequest, res: Response) => {
    const { question } = req.body;
    const patientId = req.user?.patientProfileId || 'pat_101';

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    try {
      // 1. Fetch real-time patient profile data for grounding
      const profileRes = await PatientModel.findById(patientId);
      const patient = profileRes.rowCount ? profileRes.rows[0] : null;

      // 2. Fetch today's medications
      const todayStr = new Date().toISOString().split('T')[0];
      const medsRes = await MedicationModel.getDailyScheduleWithAdherence(patientId, todayStr);
      const meds = medsRes.rows || [];

      const takenMeds = meds.filter((m: any) => m.status === 'taken').map((m: any) => `${m.name} (${m.dosage})`);
      const pendingMeds = meds.filter((m: any) => m.status !== 'taken').map((m: any) => `${m.name} (${m.dosage}) at ${m.scheduledTime}`);

      // 3. Fetch today's exercises
      const exRes = await query(
        'SELECT title, duration_minutes, category, is_completed FROM daily_exercises WHERE patient_id = $1',
        [patientId]
      );
      const exercises = exRes.rows || [];
      const completedExercises = exercises.filter((e: any) => e.is_completed).map((e: any) => `${e.title} (${e.duration_minutes} mins)`);
      const pendingExercises = exercises.filter((e: any) => !e.is_completed).map((e: any) => `${e.title} (${e.duration_minutes} mins)`);

      const liveContext: PatientLiveContext = {
        patientName: patient?.full_name || 'Robert Harrison',
        age: patient?.age || 74,
        bloodPressure: patient?.blood_pressure || '120/80 mmHg',
        heartRate: patient?.heart_rate || 72,
        bloodSugar: patient?.blood_sugar || '100 mg/dL',
        streakDays: patient?.streak_days ?? 0,
        totalMedications: meds.length,
        takenMedications: takenMeds,
        pendingMedications: pendingMeds,
        completedExercises: completedExercises,
        pendingExercises: pendingExercises,
      };

      // 4. Send request to Gemini with guardrails and live data context
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
