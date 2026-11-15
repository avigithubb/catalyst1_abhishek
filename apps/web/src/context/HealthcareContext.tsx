import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medication, PatientProfile, DailyExercise } from '@elderly-care/shared-types';
import { useAuth } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_URL
  ? `https://${import.meta.env.VITE_API_URL}`
  : '${API_BASE}';

interface HealthcareContextType {
  profile: PatientProfile | null;
  medications: Medication[];
  exercises: DailyExercise[];
  streakDays: number;
  missedYesterdayCount: number;
  healthCondition: string;
  isLoading: boolean;
  alertBannerMessage: string | null;
  fetchDashboardData: () => Promise<void>;
  toggleMedicationStatus: (medicationId: string) => Promise<void>;
  toggleExerciseStatus: (exerciseId: string) => Promise<void>;
  addMedication: (med: Omit<Medication, 'id' | 'patientId' | 'status' | 'dueDate'>) => Promise<void>;
  triggerAdherenceCronCheck: () => Promise<{ sent: boolean; message: string }>;
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

export const HealthcareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token, isNewUser, user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [exercises, setExercises] = useState<DailyExercise[]>([]);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [missedYesterdayCount, setMissedYesterdayCount] = useState<number>(0);
  const [healthCondition, setHealthCondition] = useState<string>('New Profile Initialized');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertBannerMessage, setAlertBannerMessage] = useState<string | null>(null);

  // Default initial profile for brand-new signups (0 days streak, pending medications, 0 completed exercises)
  const getNewUserProfile = (userName?: string): PatientProfile => ({
    id: `pat_${Date.now()}`,
    fullName: userName || 'New Member Profile',
    age: 68,
    bloodGroup: 'Pending Check',
    emergencyContact: 'Not configured yet',
    medicalConditions: ['Initial registration'],
    allergies: ['None reported'],
    currentHealthStatus: 'Good',
    vitalSigns: {
      bloodPressure: '120/80 mmHg',
      heartRate: 70,
      bloodSugar: '95 mg/dL',
      lastUpdated: 'Just now',
    },
    streakDays: 0,
    accessPasscode: '2026',
  });

  const getNewUserMedications = (): Medication[] => [
    {
      id: 'med_initial_1',
      patientId: 'pat_new',
      name: 'Prescription Daily Multivitamin',
      dosage: '1 tablet',
      frequency: 'Once daily',
      instructions: 'Take in the morning with a glass of water',
      scheduledTime: '08:00 AM',
      foodRelation: 'After Food',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'med_initial_2',
      patientId: 'pat_new',
      name: 'Calcium & Vitamin D',
      dosage: '500 mg',
      frequency: 'Once daily',
      instructions: 'Take after afternoon meal',
      scheduledTime: '01:30 PM',
      foodRelation: 'With Food',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
    }
  ];

  const getNewUserExercises = (): DailyExercise[] => [
    {
      id: 'ex_new_1',
      patientId: 'pat_new',
      title: 'Gentle Morning Walk',
      durationMinutes: 15,
      category: 'Walking',
      instructions: 'Short, comfortable stroll to activate circulation.',
      completed: false,
      scheduledTime: '08:30 AM'
    },
    {
      id: 'ex_new_2',
      patientId: 'pat_new',
      title: 'Deep Breathing Therapy',
      durationMinutes: 10,
      category: 'Breathing Exercise',
      instructions: 'Relaxed seated diaphragmatic breathing.',
      completed: false,
      scheduledTime: '06:00 PM'
    }
  ];

  // Established demo profile for existing demo login (`caregiver@family.org`)
  const defaultEstablishedProfile: PatientProfile = {
    id: 'pat_101',
    fullName: 'Robert Harrison',
    age: 74,
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 234-8976 (Daughter - Sarah)',
    medicalConditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    currentHealthStatus: 'Stable',
    vitalSigns: {
      bloodPressure: '124/82 mmHg',
      heartRate: 72,
      bloodSugar: '110 mg/dL',
      lastUpdated: 'Today, 8:30 AM',
    },
    streakDays: 14,
    accessPasscode: '2026',
  };

  const defaultEstablishedMedications: Medication[] = [
    {
      id: 'med_1',
      patientId: 'pat_101',
      name: 'Amlodipine Besylate',
      dosage: '5 mg',
      frequency: 'Once daily',
      instructions: 'Take in the morning with a glass of water',
      scheduledTime: '08:00 AM',
      foodRelation: 'After Food',
      status: 'taken',
      dueDate: new Date().toISOString().split('T')[0],
      lastTakenAt: '08:15 AM'
    },
    {
      id: 'med_2',
      patientId: 'pat_101',
      name: 'Metformin Hydrochloride',
      dosage: '500 mg',
      frequency: 'Twice daily',
      instructions: 'Take immediately after breakfast and dinner',
      scheduledTime: '09:00 AM',
      foodRelation: 'With Food',
      status: 'taken',
      dueDate: new Date().toISOString().split('T')[0],
      lastTakenAt: '09:10 AM'
    },
    {
      id: 'med_3',
      patientId: 'pat_101',
      name: 'Atorvastatin Calcium',
      dosage: '20 mg',
      frequency: 'Once at night',
      instructions: 'Take right before bedtime',
      scheduledTime: '08:30 PM',
      foodRelation: 'After Food',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'med_4',
      patientId: 'pat_101',
      name: 'Vitamin D3 & Calcium',
      dosage: '1000 IU',
      frequency: 'Once daily',
      instructions: 'Take with post-lunch snack',
      scheduledTime: '02:00 PM',
      foodRelation: 'With Food',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
    }
  ];

  const defaultEstablishedExercises: DailyExercise[] = [
    {
      id: 'ex_1',
      patientId: 'pat_101',
      title: 'Morning Garden Walk',
      durationMinutes: 20,
      category: 'Walking',
      instructions: 'Gentle, steady walk around the garden with comfortable shoes.',
      completed: true,
      scheduledTime: '07:30 AM'
    },
    {
      id: 'ex_2',
      patientId: 'pat_101',
      title: 'Gentle Chair Yoga & Spine Stretch',
      durationMinutes: 15,
      category: 'Chair Yoga',
      instructions: 'Seated spinal twists, shoulder rolls, and ankle flexes.',
      completed: false,
      scheduledTime: '11:30 AM'
    },
    {
      id: 'ex_3',
      patientId: 'pat_101',
      title: 'Deep Breathing (Pranayama)',
      durationMinutes: 10,
      category: 'Breathing Exercise',
      instructions: 'Diaphragmatic 4-7-8 breathing to relax pulse and expand lungs.',
      completed: false,
      scheduledTime: '05:00 PM'
    }
  ];

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (token) {
        const res = await fetch('${API_BASE}/api/medications/daily', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // If brand new user with 0 activity, respect clean zero start
          if (isNewUser) {
            setProfile(data.profile || getNewUserProfile(user?.name));
            setMedications(getNewUserMedications());
            setExercises(getNewUserExercises());
            setStreakDays(0);
            setMissedYesterdayCount(0);
            setHealthCondition('Good (Day 1 Starting)');
          } else {
            setProfile(data.profile || defaultEstablishedProfile);
            setMedications(data.medications || defaultEstablishedMedications);
            setExercises(data.exercises || defaultEstablishedExercises);
            setStreakDays(data.streakDays ?? 14);
            setMissedYesterdayCount(data.missedCountYesterday ?? 0);
            setHealthCondition(data.healthStatus || 'Stable & Active');
          }
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      if (isNewUser) {
        setProfile(getNewUserProfile(user?.name));
        setMedications(getNewUserMedications());
        setExercises(getNewUserExercises());
        setStreakDays(0);
        setMissedYesterdayCount(0);
        setHealthCondition('Good (Day 1 Starting)');
      } else if (!profile) {
        setProfile(defaultEstablishedProfile);
        setMedications(defaultEstablishedMedications);
        setExercises(defaultEstablishedExercises);
        setStreakDays(14);
        setHealthCondition('Stable & Active');
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isNewUser]);

  const toggleMedicationStatus = async (medicationId: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medicationId) {
          const nextStatus = m.status === 'taken' ? 'pending' : 'taken';
          return {
            ...m,
            status: nextStatus,
            lastTakenAt: nextStatus === 'taken' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return m;
      })
    );

    setStreakDays((curr) => curr + 1);

    if (token) {
      try {
        await fetch(`${API_BASE}/api/medications/${medicationId}/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
      } catch (err) {
        console.warn('API sync warning:', err);
      }
    }
  };

  const toggleExerciseStatus = async (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === exerciseId ? { ...e, completed: !e.completed } : e))
    );

    if (token) {
      try {
        await fetch(`${API_BASE}/api/exercises/${exerciseId}/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
      } catch (err) {
        console.warn('Exercise API sync warning:', err);
      }
    }
  };

  const addMedication = async (med: Omit<Medication, 'id' | 'patientId' | 'status' | 'dueDate'>) => {
    const newMed: Medication = {
      ...med,
      id: `med_${Date.now()}`,
      patientId: profile?.id || 'pat_101',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
    };
    setMedications((prev) => [newMed, ...prev]);

    if (token) {
      try {
        await fetch('${API_BASE}/api/medications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newMed),
        });
      } catch (err) {
        console.warn('Medication create sync warning:', err);
      }
    }
  };

  const triggerAdherenceCronCheck = async (): Promise<{ sent: boolean; message: string }> => {
    try {
      const res = await fetch('${API_BASE}/api/medications/cron-check-adherence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAlertBannerMessage(data.message);
      return { sent: true, message: data.message };
    } catch {
      const simulatedMsg = 'Simulated Alert: Streak checked. Automated email notification dispatched according to missed medication thresholds.';
      setAlertBannerMessage(simulatedMsg);
      return { sent: true, message: simulatedMsg };
    }
  };

  return (
    <HealthcareContext.Provider
      value={{
        profile,
        medications,
        exercises,
        streakDays,
        missedYesterdayCount,
        healthCondition,
        isLoading,
        alertBannerMessage,
        fetchDashboardData,
        toggleMedicationStatus,
        toggleExerciseStatus,
        addMedication,
        triggerAdherenceCronCheck,
      }}
    >
      {children}
    </HealthcareContext.Provider>
  );
};

export const useHealthcare = () => {
  const context = useContext(HealthcareContext);
  if (!context) {
    throw new Error('useHealthcare must be used within a HealthcareProvider');
  }
  return context;
};
