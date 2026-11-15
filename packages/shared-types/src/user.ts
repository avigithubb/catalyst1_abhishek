export type Role = 'patient' | 'caregiver' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  patientProfileId?: string; // Shared family account reference
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  sharedProfileId: string;
}
