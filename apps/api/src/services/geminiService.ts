import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const GEMINI_KEY = process.env.GEMINI_API_URL || process.env.GEMINI_API_KEY || '';

export interface PatientLiveContext {
  patientName: string;
  age: number;
  bloodPressure: string;
  heartRate: number;
  bloodSugar: string;
  streakDays: number;
  totalMedications: number;
  takenMedications: string[];
  pendingMedications: string[];
  completedExercises: string[];
  pendingExercises: string[];
}

export const geminiService = {
  chatWithDoctorBot: async (userMessage: string, patientContext?: PatientLiveContext) => {
    if (!GEMINI_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const contextPrompt = patientContext ? `
CURRENT LIVE PATIENT HEALTH DATA & ACTIVITY DOSSIER:
- Patient Name: ${patientContext.patientName} (Age: ${patientContext.age})
- Current Vitals: Blood Pressure: ${patientContext.bloodPressure}, Heart Rate: ${patientContext.heartRate} bpm, Blood Sugar: ${patientContext.bloodSugar}
- Current Adherence Streak: ${patientContext.streakDays} continuous days
- Total Medications Scheduled for Today: ${patientContext.totalMedications}
- Medications ALREADY TAKEN Today: ${patientContext.takenMedications.length > 0 ? patientContext.takenMedications.join(', ') : 'None marked taken yet'}
- Medications STILL PENDING Today: ${patientContext.pendingMedications.length > 0 ? patientContext.pendingMedications.join(', ') : 'All daily medications taken'}
- Exercises COMPLETED Today: ${patientContext.completedExercises.length > 0 ? patientContext.completedExercises.join(', ') : '0 exercises completed today'}
- Exercises STILL PENDING Today: ${patientContext.pendingExercises.length > 0 ? patientContext.pendingExercises.join(', ') : 'All daily exercises completed'}
` : '';

    const systemInstruction = `
You are "Dr. Gemini", a specialized, compassionate, geriatric medical AI assistant built into the ElderCare Connect platform for elderly individuals, caretakers, and doctors.

CORE RESTRICTIONS & GUARDRAILS:
1. ONLY answer questions related to:
   - Medical health, wellness, symptoms, physical therapy, and medicines/prescriptions.
   - The user's live profile data on this platform (such as today's exercises completed, medications due or taken, vital signs, and adherence streak) as provided in the LIVE DOSSIER above.
2. STRICT REFUSAL POLICY: If the user asks general, non-medical questions (such as coding, history, politics, math, entertainment, sports, or creative writing), politely refuse with:
   "I am Dr. Gemini, your dedicated healthcare and medication assistant. I can only assist with medical, medication, wellness questions, and your daily health progress on this platform."
3. GROUNDING WITH PATIENT DATA: If the user asks about their website activity (e.g. "How many exercises did I do today?", "Did I take my blood pressure medicine?", "What is my current streak?"), consult the CURRENT LIVE PATIENT HEALTH DATA & ACTIVITY DOSSIER above and answer accurately, concisely, and warmly.
4. MEDICAL SAFETY DISCLAIMER: Keep answers clear, accessible, and structured for seniors. Always remind them that while you provide clinical guidance, emergencies require dialing their doctor or local emergency services.
`;

    const promptPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\n${contextPrompt}\n\nUSER QUESTION: ${userMessage}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      }
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Gemini API Error]', errText);
      throw new Error(`Gemini API request failed with status ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || "I am here to help with your medical care. Could you please rephrase your health question?";
  }
};
