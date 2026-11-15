import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

interface MockMedication {
  id: string;
  name: string;
  status: 'pending' | 'taken';
  scheduledTime: string;
}

const calculateAdherenceRate = (medications: MockMedication[]): number => {
  if (medications.length === 0) return 100;
  const takenCount = medications.filter((m) => m.status === 'taken').length;
  return Math.round((takenCount / medications.length) * 100);
};

const determineAdherenceStreak = (currentStreak: number, isTodayComplete: boolean): number => {
  return isTodayComplete ? currentStreak + 1 : currentStreak;
};

const shouldTriggerCaregiverAlert = (missedDosesCount: number): boolean => {
  // Alert caregiver if 2 or more doses are missed
  return missedDosesCount >= 2;
};

describe('Medication Adherence & Streak Engine Tests', () => {
  test('calculateAdherenceRate calculates correct adherence percentage', () => {
    const meds: MockMedication[] = [
      { id: '1', name: 'Amlodipine', status: 'taken', scheduledTime: '08:00 AM' },
      { id: '2', name: 'Metformin', status: 'taken', scheduledTime: '09:00 AM' },
      { id: '3', name: 'Atorvastatin', status: 'pending', scheduledTime: '08:30 PM' },
      { id: '4', name: 'Vitamin D3', status: 'pending', scheduledTime: '02:00 PM' },
    ];

    assert.equal(calculateAdherenceRate(meds), 50);

    meds[2].status = 'taken';
    assert.equal(calculateAdherenceRate(meds), 75);

    meds[3].status = 'taken';
    assert.equal(calculateAdherenceRate(meds), 100);
  });

  test('determineAdherenceStreak increments streak on completed schedule', () => {
    assert.equal(determineAdherenceStreak(14, true), 15);
    assert.equal(determineAdherenceStreak(14, false), 14);
    assert.equal(determineAdherenceStreak(0, true), 1);
  });

  test('shouldTriggerCaregiverAlert triggers alert when threshold is reached', () => {
    assert.equal(shouldTriggerCaregiverAlert(0), false);
    assert.equal(shouldTriggerCaregiverAlert(1), false);
    assert.equal(shouldTriggerCaregiverAlert(2), true); // 2 missed doses = alert caregiver
    assert.equal(shouldTriggerCaregiverAlert(3), true);
  });
});
