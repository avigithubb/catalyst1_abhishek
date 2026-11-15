import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool } from './connection';

export const initializeDatabase = async () => {
  console.log('--- Initializing PostgreSQL Schema and Seeding Default Demo Data ---');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('✓ Tables, constraints and indexes created successfully.');

    // Seed default shared patient profile if not present
    const patientRes = await pool.query('SELECT id FROM patient_profiles WHERE id = $1', ['pat_101']);
    if (patientRes.rowCount === 0) {
      await pool.query(`
        INSERT INTO patient_profiles (
          id, full_name, age, blood_group, emergency_contact, current_health_status, 
          blood_pressure, heart_rate, blood_sugar, streak_days, access_passcode
        ) VALUES (
          'pat_101', 'Robert Harrison', 74, 'O+', '+1 (555) 234-8976 (Daughter - Sarah)', 
          'Stable & Active', '124/82 mmHg', 72, '110 mg/dL', 14, '2026'
        );
      `);
      console.log('✓ Seeded default patient profile: Robert Harrison (Passcode: 2026)');

      // Seed Caregiver User with hashed password (bcrypt)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('Password@123', saltRounds);
      await pool.query(`
        INSERT INTO users (id, patient_profile_id, email, password_hash, name, role, phone)
        VALUES 
        ('usr_sarah', 'pat_101', 'caregiver@family.org', $1, 'Sarah Harrison', 'caregiver', '+1 (555) 234-8976'),
        ('usr_patient', 'pat_101', 'robert.harrison@eldercare.local', $1, 'Robert Harrison', 'patient', '+1 (555) 234-8976'),
        ('usr_doctor', 'pat_101', 'dr.miller@hospital.org', $1, 'Dr. Arthur Miller', 'doctor', '+1 (555) 432-1098')
        ON CONFLICT (email) DO NOTHING;
      `, [hashedPassword]);
      console.log('✓ Seeded authorized users with bcrypt hashed passwords.');

      // Seed daily medications
      await pool.query(`
        INSERT INTO medications (id, patient_id, name, dosage, frequency, instructions, scheduled_time, food_relation)
        VALUES 
        ('med_1', 'pat_101', 'Amlodipine Besylate', '5 mg', 'Once daily', 'Take in the morning with a glass of water', '08:00 AM', 'After Food'),
        ('med_2', 'pat_101', 'Metformin Hydrochloride', '500 mg', 'Twice daily', 'Take immediately after breakfast and dinner', '09:00 AM', 'With Food'),
        ('med_3', 'pat_101', 'Atorvastatin Calcium', '20 mg', 'Once at night', 'Take right before bedtime', '08:30 PM', 'After Food'),
        ('med_4', 'pat_101', 'Vitamin D3 & Calcium', '1000 IU', 'Once daily', 'Take with post-lunch snack', '02:00 PM', 'With Food')
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✓ Seeded medications.');

      // Seed Daily Exercises
      await pool.query(`
        INSERT INTO daily_exercises (id, patient_id, title, duration_minutes, category, instructions, scheduled_time, is_completed)
        VALUES
        ('ex_1', 'pat_101', 'Morning Garden Walk', 20, 'Walking', 'Gentle, steady walk around the garden with comfortable shoes.', '07:30 AM', true),
        ('ex_2', 'pat_101', 'Gentle Chair Yoga & Spine Stretch', 15, 'Chair Yoga', 'Seated spinal twists, shoulder rolls, and ankle flexes.', '11:30 AM', false),
        ('ex_3', 'pat_101', 'Deep Breathing (Pranayama)', 10, 'Breathing Exercise', 'Diaphragmatic 4-7-8 breathing to relax pulse and expand lungs.', '05:00 PM', false)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✓ Seeded daily exercise wellness routine.');
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
};

if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Database init script finished.');
    process.exit(0);
  });
}
