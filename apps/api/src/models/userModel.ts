import { query } from '../db/connection';

export interface UserEntity {
  id: string;
  patient_profile_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  phone?: string;
  oauth_provider?: string;
  oauth_id?: string;
  created_at: string;
}

export const UserModel = {
  findByEmailOrUsernameWithProfile: async (identifier: string) => {
    const clean = identifier.trim().toLowerCase();
    return query(
      `SELECT u.id, u.patient_profile_id, u.email, u.password_hash, u.name, u.role, p.access_passcode 
       FROM users u 
       JOIN patient_profiles p ON u.patient_profile_id = p.id 
       WHERE LOWER(u.email) = $1 OR LOWER(u.name) = $1`,
      [clean]
    );
  },

  findByEmailWithProfile: async (email: string) => {
    const clean = email.trim().toLowerCase();
    return query(
      `SELECT u.id, u.patient_profile_id, u.email, u.password_hash, u.name, u.role, p.access_passcode 
       FROM users u 
       JOIN patient_profiles p ON u.patient_profile_id = p.id 
       WHERE LOWER(u.email) = $1`,
      [clean]
    );
  },

  findByEmail: async (email: string) => {
    return query('SELECT id, email, name, role FROM users WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
  },

  findById: async (id: string) => {
    return query(
      'SELECT id, patient_profile_id, email, name, role, created_at FROM users WHERE id = $1',
      [id]
    );
  },

  create: async (user: { id: string; patientProfileId: string; email: string; passwordHash: string; name: string; role: string }) => {
    return query(
      `INSERT INTO users (id, patient_profile_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, patient_profile_id, email, name, role`,
      [user.id, user.patientProfileId, user.email.trim().toLowerCase(), user.passwordHash, user.name.trim(), user.role]
    );
  },

  findCaregiverEmailsByPatientId: async (patientId: string) => {
    return query(
      'SELECT email, role FROM users WHERE patient_profile_id = $1',
      [patientId]
    );
  },

  findPatientEmailByPatientId: async (patientId: string) => {
    return query(
      "SELECT email FROM users WHERE patient_profile_id = $1 AND role = 'patient' LIMIT 1",
      [patientId]
    );
  }
};
