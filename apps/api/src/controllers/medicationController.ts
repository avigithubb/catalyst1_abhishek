import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MedicationModel } from '../models/medicationModel';
import { PatientModel } from '../models/patientModel';
import { UserModel } from '../models/userModel';
import { emailService } from '../services/emailService';
import { pool, query } from '../db/connection';

export const MedicationController = {
  getDailyChecklist: async (req: AuthRequest, res: Response) => {
    const patientId = req.user?.patientProfileId || 'pat_101';
    const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];

    try {
      const profileRes = await PatientModel.findById(patientId);
      if (profileRes.rowCount === 0) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      const patient = profileRes.rows[0];

      // Single SQL JOIN preventing N+1 queries
      const medsRes = await MedicationModel.getDailyScheduleWithAdherence(patientId, targetDate);

      // Fetch Exercises
      const exercisesRes = await query(
        `SELECT id, patient_id AS "patientId", title, duration_minutes AS "durationMinutes", 
                category, instructions, scheduled_time AS "scheduledTime", is_completed AS completed
         FROM daily_exercises 
         WHERE patient_id = $1
         ORDER BY scheduled_time ASC`,
        [patientId]
      );

      // Check yesterday's missed count
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const yesterdayMissedRes = await MedicationModel.getMissedCountForDate(patientId, yesterdayStr);

      return res.json({
        profile: {
          id: patient.id,
          fullName: patient.full_name,
          age: patient.age,
          bloodGroup: patient.blood_group,
          emergencyContact: patient.emergency_contact,
          currentHealthStatus: patient.current_health_status,
          vitalSigns: {
            bloodPressure: patient.blood_pressure,
            heartRate: patient.heart_rate,
            bloodSugar: patient.blood_sugar,
            lastUpdated: 'Today',
          },
          streakDays: patient.streak_days,
          accessPasscode: patient.access_passcode,
        },
        streakDays: patient.streak_days,
        missedCountYesterday: yesterdayMissedRes.rows[0]?.count || 0,
        healthStatus: patient.current_health_status,
        medications: medsRes.rows,
        exercises: exercisesRes.rows,
      });
    } catch (error) {
      console.error('MedicationController.getDailyChecklist error:', error);
      return res.status(500).json({ message: 'Failed to retrieve medication schedule' });
    }
  },

  toggleStatus: async (req: AuthRequest, res: Response) => {
    const medicationId = req.params.id;
    const patientId = req.user?.patientProfileId || 'pat_101';
    const userId = req.user?.userId;
    const todayStr = new Date().toISOString().split('T')[0];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const checkRes = await client.query(
        `SELECT status FROM medication_adherence_logs 
         WHERE patient_id = $1 AND medication_id = $2 AND scheduled_date = $3
         FOR UPDATE`,
        [patientId, medicationId, todayStr]
      );

      let nextStatus = 'taken';
      let takenAt: Date | null = new Date();

      if (checkRes.rowCount && checkRes.rows[0].status === 'taken') {
        nextStatus = 'pending';
        takenAt = null;
      }

      await client.query(
        `INSERT INTO medication_adherence_logs (id, patient_id, medication_id, scheduled_date, status, taken_at, logged_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (patient_id, medication_id, scheduled_date)
         DO UPDATE SET status = EXCLUDED.status, taken_at = EXCLUDED.taken_at, logged_by_user_id = EXCLUDED.logged_by_user_id`,
        [`adh_${Date.now()}_${Math.random().toString(36).substring(7)}`, patientId, medicationId, todayStr, nextStatus, takenAt, userId]
      );

      await client.query('COMMIT');
      return res.json({
        success: true,
        status: nextStatus,
        lastTakenAt: takenAt ? takenAt.toISOString() : null,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('MedicationController.toggleStatus error:', error);
      return res.status(500).json({ message: 'Transaction rolled back: failed to update medication' });
    } finally {
      client.release();
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    const patientId = req.user?.patientProfileId || 'pat_101';
    const { name, dosage, frequency, instructions, scheduledTime, foodRelation } = req.body;

    if (!name || !dosage || !scheduledTime) {
      return res.status(400).json({ message: 'Missing required medication fields' });
    }

    try {
      const medId = `med_${Date.now()}`;
      await MedicationModel.create({
        id: medId,
        patientId,
        name,
        dosage,
        frequency: frequency || 'Once daily',
        instructions: instructions || '',
        scheduledTime,
        foodRelation: foodRelation || 'After Food',
      });
      return res.status(201).json({ id: medId, message: 'Medication scheduled successfully' });
    } catch (error) {
      console.error('MedicationController.create error:', error);
      return res.status(500).json({ message: 'Failed to create medication' });
    }
  },

  checkAdherenceCron: async (req: AuthRequest, res: Response) => {
    const patientId = req.user?.patientProfileId || 'pat_101';
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const pRes = await client.query('SELECT full_name, streak_days FROM patient_profiles WHERE id = $1', [patientId]);
      if (pRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Patient not found' });
      }
      const patient = pRes.rows[0];

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const missedYesterdayRes = await MedicationModel.getMissedForDate(patientId, yesterdayStr);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

      const missedTwoDaysAgoRes = await MedicationModel.getMissedCountForDate(patientId, twoDaysAgoStr);

      const missedYesterdayList = missedYesterdayRes.rows.map((r: any) => `${r.name} (${r.dosage}) at ${r.scheduled_time}`);
      const isYesterdayMissed = missedYesterdayList.length > 0;
      const isMoreThanTwoDaysMissed = isYesterdayMissed && (missedTwoDaysAgoRes.rows[0].count > 0);

      let notificationSummary = 'Adherence check complete: All scheduled medications up to date.';

      if (isMoreThanTwoDaysMissed) {
        const membersRes = await UserModel.findCaregiverEmailsByPatientId(patientId);
        const recipientEmails = membersRes.rows.map((u: any) => u.email);

        await PatientModel.updateStreakAndStatus(patientId, 0, 'Needs Attention');

        await MedicationModel.logAlert({
          id: `alt_${Date.now()}`,
          patientId,
          alertType: 'multiple_days_alert',
          missedDaysCount: 3,
          missedMedications: missedYesterdayList,
          recipients: recipientEmails,
        });

        const emailHtml = emailService.generateCriticalMultiDayAlertEmail(patient.full_name, 3, missedYesterdayList);
        await emailService.sendEmail({
          to: recipientEmails,
          subject: `🚨 CRITICAL ESCALATION: 2+ Days Missed Medications for ${patient.full_name}`,
          html: emailHtml,
        });

        notificationSummary = `Critical Alert: Medication missed > 2 days! Escalation email dispatched to all ${recipientEmails.length} authorized caretakers. Streak reset to 0.`;
      } else if (isYesterdayMissed) {
        const patientUserRes = await UserModel.findPatientEmailByPatientId(patientId);
        const patientEmail = patientUserRes.rowCount ? patientUserRes.rows[0].email : 'robert.harrison@eldercare.local';

        await PatientModel.updateStreakAndStatus(patientId, 0);

        await MedicationModel.logAlert({
          id: `alt_${Date.now()}`,
          patientId,
          alertType: 'single_day_missed',
          missedDaysCount: 1,
          missedMedications: missedYesterdayList,
          recipients: [patientEmail],
        });

        const emailHtml = emailService.generateSingleDayMissedEmail(patient.full_name, missedYesterdayList);
        await emailService.sendEmail({
          to: patientEmail,
          subject: `⚠️ Reminder: Medication left due yesterday for ${patient.full_name}`,
          html: emailHtml,
        });

        notificationSummary = `Reminder: Medication due yesterday. Single reminder email sent only to ${patientEmail}. Streak reset.`;
      }

      await client.query('COMMIT');
      return res.json({ success: true, message: notificationSummary });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('MedicationController.checkAdherenceCron error:', error);
      return res.status(500).json({ message: 'Failed to run adherence evaluation' });
    } finally {
      client.release();
    }
  }
};
