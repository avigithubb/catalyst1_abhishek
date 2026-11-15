import { ApiClient } from './client';

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  location: string;
  notes: string;
}

export const appointmentsApi = {
  getAppointments: async (patientId?: string): Promise<Appointment[]> => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return ApiClient.request<Appointment[]>(`/appointments${query}`);
  }
};
