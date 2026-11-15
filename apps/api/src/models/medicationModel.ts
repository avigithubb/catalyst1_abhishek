import { query, pool } from '../db/connection';

export const MedicationModel = {
  getDailyScheduleWithAdherence: async (patientId: string, targetDate: string) => {
    // Single consolidated SQL query preventing N+1 vulnerability
    return query(
      `SELECT 
          m.id, 
          m.patient_id, 
          m.name, 
          m.dosage, 
          m.frequency, 
          m.instructions, 
          m.scheduled_time AS "scheduledTime", 
          m.food_relation AS "foodRelation",
          COALESCE(l.status, 'pending') AS status,
          l.taken_at AS "lastTakenAt",
          $2::text AS "dueDate"
       FROM medications m
       LEFT JOIN medication_adherence_logs l 
         ON m.id = l.medication_id 
        AND l.scheduled_date = $2::date
       WHERE m.patient_id = $1 AND m.is_active = true
       ORDER BY m.scheduled_time ASC`,
      [patientId, targetDate]
    );
  },

  create: async (data: {
    id: string;
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    scheduledTime: string;
    foodRelation: string;
  }) => {
    return query(
      `INSERT INTO medications (id, patient_id, name, dosage, frequency, instructions, scheduled_time, food_relation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, dosage, frequency`,
      [data.id, data.patientId, data.name, data.dosage, data.frequency, data.instructions, data.scheduledTime, data.foodRelation]
    );
  },

  getMissedForDate: async (patientId: string, dateStr: string) => {
    return query(
      `SELECT m.name, m.dosage, m.scheduled_time 
       FROM medications m
       LEFT JOIN medication_adherence_logs l 
         ON m.id = l.medication_id AND l.scheduled_date = $2::date
       WHERE m.patient_id = $1 
         AND (l.status IS NULL OR l.status != 'taken')`,
      [patientId, dateStr]
    );
  },

  getMissedCountForDate: async (patientId: string, dateStr: string) => {
    return query(
      `SELECT count(*)::int AS count
       FROM medications m
       LEFT JOIN medication_adherence_logs l 
         ON m.id = l.medication_id AND l.scheduled_date = $2::date
       WHERE m.patient_id = $1 
         AND (l.status IS NULL OR l.status != 'taken')`,
      [patientId, dateStr]
    );
  },

  logAlert: async (data: {
    id: string;
    patientId: string;
    alertType: string;
    missedDaysCount: number;
    missedMedications: string[];
    recipients: string[];
  }) => {
    return query(
      `INSERT INTO adherence_alerts (id, patient_id, alert_type, missed_days_count, missed_medications, recipients)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.id, data.patientId, data.alertType, data.missedDaysCount, JSON.stringify(data.missedMedications), JSON.stringify(data.recipients)]
    );
  }
};
