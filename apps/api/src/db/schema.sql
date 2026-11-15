-- ==========================================================
-- Elderly Care & Medication Management Platform Schema
-- PostgreSQL DDL with ACID Constraints & Normalized Tables
-- ==========================================================

-- 1. Patient Profiles (Shared family account ecosystem)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    age INT NOT NULL CHECK (age >= 0),
    blood_group VARCHAR(8) NOT NULL,
    emergency_contact VARCHAR(128) NOT NULL,
    current_health_status VARCHAR(64) NOT NULL DEFAULT 'Stable',
    blood_pressure VARCHAR(32) NOT NULL DEFAULT '120/80 mmHg',
    heart_rate INT NOT NULL DEFAULT 72,
    blood_sugar VARCHAR(32) NOT NULL DEFAULT '100 mg/dL',
    streak_days INT NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    access_passcode VARCHAR(32) NOT NULL, -- Passcode required for family/caretaker access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Caretakers, Doctors, Family members, Patients)
-- Passwords stored using bcrypt cryptographic hashing
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    patient_profile_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('patient', 'caregiver', 'doctor', 'admin')),
    phone VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Medications (Prescribed medications schedule)
CREATE TABLE IF NOT EXISTS medications (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    dosage VARCHAR(64) NOT NULL,
    frequency VARCHAR(64) NOT NULL,
    instructions TEXT,
    scheduled_time VARCHAR(32) NOT NULL,
    food_relation VARCHAR(32) NOT NULL DEFAULT 'After Food',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Medication Adherence Logs (ACID tracked adherence records)
CREATE TABLE IF NOT EXISTS medication_adherence_logs (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    medication_id VARCHAR(64) NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('taken', 'pending', 'missed', 'skipped')),
    taken_at TIMESTAMP WITH TIME ZONE,
    logged_by_user_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_patient_med_day UNIQUE (patient_id, medication_id, scheduled_date)
);

-- 5. Daily Exercises (Senior mobility, walking, and physical therapy)
CREATE TABLE IF NOT EXISTS daily_exercises (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    duration_minutes INT NOT NULL,
    category VARCHAR(64) NOT NULL,
    instructions TEXT,
    scheduled_time VARCHAR(32) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Adherence Alert Audit Logs (Email reminder escalation records)
CREATE TABLE IF NOT EXISTS adherence_alerts (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    alert_type VARCHAR(64) NOT NULL CHECK (alert_type IN ('single_day_missed', 'multiple_days_alert')),
    missed_days_count INT NOT NULL,
    missed_medications JSONB NOT NULL,
    recipients JSONB NOT NULL,
    email_status VARCHAR(32) NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes to guarantee high performance and avoid full-table scans
CREATE INDEX IF NOT EXISTS idx_adherence_patient_date ON medication_adherence_logs(patient_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_users_patient ON users(patient_profile_id);
CREATE INDEX IF NOT EXISTS idx_exercises_patient_date ON daily_exercises(patient_id, scheduled_date);
