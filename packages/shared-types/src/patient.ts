export interface PatientProfile {
  id: string;
  fullName: string;
  age: number;
  bloodGroup: string;
  emergencyContact: string;
  medicalConditions: string[];
  allergies: string[];
  currentHealthStatus: 'Stable' | 'Needs Attention' | 'Critical' | 'Good';
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    bloodSugar: string;
    lastUpdated: string;
  };
  streakDays: number;
  lastAdherenceDate?: string;
  accessPasscode: string; // Passcode for shared family account access
}

export interface DailyExercise {
  id: string;
  patientId: string;
  title: string;
  durationMinutes: number;
  category: 'Walking' | 'Mobility & Stretching' | 'Chair Yoga' | 'Breathing Exercise' | 'Balance Training';
  instructions: string;
  completed: boolean;
  scheduledTime: string;
}
