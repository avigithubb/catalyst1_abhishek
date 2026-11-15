export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  scheduledTime: string; // e.g. "08:00 AM", "01:00 PM", "08:00 PM"
  foodRelation: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach';
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  lastTakenAt?: string;
  dueDate: string; // YYYY-MM-DD
}

export interface AdherenceLog {
  id: string;
  patientId: string;
  medicationId: string;
  date: string;
  status: 'taken' | 'missed';
  loggedByUserId: string;
  createdAt: string;
}

export interface ReminderAlert {
  id: string;
  patientId: string;
  type: 'single_day_missed' | 'multiple_days_alert' | 'critical_overdue';
  missedDaysCount: number;
  missedMedications: string[];
  recipientEmails: string[];
  sentAt: string;
}
