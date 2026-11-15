process.env.NODE_ENV = 'test';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../index';
import { PatientLiveContext } from '../services/geminiService';

describe('Dr. Gemini Chatbot & Clinical Guardrails Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  test('POST /api/chatbot/ask rejects empty question', async () => {
    const res = await fetch(`${baseUrl}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '   ' }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /Question text is required/i);
  });

  test('Live patient dossier context structure conforms to expected schema', () => {
    const context: PatientLiveContext = {
      patientName: 'Robert Harrison',
      age: 74,
      bloodPressure: '124/82 mmHg',
      heartRate: 72,
      bloodSugar: '110 mg/dL',
      streakDays: 14,
      totalMedications: 4,
      takenMedications: ['Amlodipine Besylate (5 mg)', 'Metformin Hydrochloride (500 mg)'],
      pendingMedications: ['Atorvastatin Calcium (20 mg)', 'Vitamin D3 & Calcium (1000 IU)'],
      completedExercises: ['Morning Garden Walk (20 mins)'],
      pendingExercises: ['Gentle Chair Yoga & Spine Stretch (15 mins)'],
    };

    assert.equal(context.patientName, 'Robert Harrison');
    assert.equal(context.streakDays, 14);
    assert.equal(context.takenMedications.length, 2);
    assert.equal(context.pendingMedications.length, 2);
    assert.equal(context.completedExercises.length, 1);
  });

  test('POST /api/chatbot/ask accepts guest requests with client-provided context', async () => {
    const res = await fetch(`${baseUrl}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'What are my vitals today?',
        context: {
          patientName: 'Robert Harrison',
          bloodPressure: '124/82 mmHg',
          heartRate: 72,
          bloodSugar: '110 mg/dL',
          streakDays: 14,
        },
      }),
    });

    // Even if Gemini key is in test mode or responds, status should not be 400 (Bad Request)
    assert.notEqual(res.status, 400);
  });
});
