import { query } from '../db/connection';

export const PatientModel = {
  findById: async (id: string) => {
    return query(
      `SELECT id, full_name, age, blood_group, emergency_contact, current_health_status, 
              blood_pressure, heart_rate, blood_sugar, streak_days, access_passcode 
       FROM patient_profiles WHERE id = $1`,
      [id]
    );
  },

  findByPasscode: async (passcode: string) => {
    return query(
      'SELECT id, access_passcode FROM patient_profiles WHERE access_passcode = $1 LIMIT 1',
      [passcode]
    );
  },

  updateStreakAndStatus: async (id: string, streakDays: number, healthStatus?: string) => {
    if (healthStatus) {
      return query(
        'UPDATE patient_profiles SET streak_days = $1, current_health_status = $2 WHERE id = $3',
        [streakDays, healthStatus, id]
      );
    }
    return query(
      'UPDATE patient_profiles SET streak_days = $1 WHERE id = $2',
      [streakDays, id]
    );
  }
};
