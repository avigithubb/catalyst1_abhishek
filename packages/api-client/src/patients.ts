import { ApiClient } from './client';
import { PatientProfile, Medication, DailyExercise } from '@elderly-care/shared-types';

export const patientApi = {
  getProfile: async (patientId?: string): Promise<PatientProfile> => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return ApiClient.request<PatientProfile>(`/patients/profile${query}`);
  },

  getDailyMedications: async (date?: string): Promise<{
    medications: Medication[];
    streakDays: number;
    missedCountYesterday: number;
    healthStatus: string;
    exercises: DailyExercise[];
  }> => {
    const query = date ? `?date=${date}` : '';
    return ApiClient.request(`/medications/daily${query}`);
  },

  toggleMedication: async (medicationId: string, status: 'taken' | 'pending' | 'missed'): Promise<{ success: boolean; streakDays: number }> => {
    return ApiClient.request(`/medications/${medicationId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  toggleExercise: async (exerciseId: string, completed: boolean): Promise<DailyExercise> => {
    return ApiClient.request(`/exercises/${exerciseId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ completed }),
    });
  },

  checkAdherenceAndNotify: async (): Promise<{ triggered: boolean; type?: string; recipients?: string[] }> => {
    return ApiClient.request(`/medications/cron-check-adherence`, {
      method: 'POST',
    });
  }
};
