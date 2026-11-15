import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  HeartPulse, 
  Flame, 
  Compass, 
  Pill, 
  Activity 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHealthcare } from '@/context/HealthcareContext';
import { useAuth } from '@/context/AuthContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { ROUTES } from '@/routes/routeConfig';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  actionTaken?: string;
}

export const HealthcareAssistantChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const navigate = useNavigate();
  const { profile, medications, exercises, streakDays, toggleMedicationStatus, toggleExerciseStatus } = useHealthcare();
  const { token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: "Hello! I am Dr. Gemini, your clinical & voice adherence assistant. You can speak to me or type naturally. Try saying: \"I took my Metformin\", \"What medicines are due?\", or \"Go to exercises\".",
      time: 'Just now',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Voice Assistant Integration
  const processQuery = useCallback(
    async (userText: string, fromVoice: boolean = false) => {
      if (!userText.trim()) return;

      const newMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newMsg]);
      setIsLoading(true);
      setActionAlert(null);

      const lower = userText.toLowerCase();
      let botReply = '';
      let actionLabel = '';

      // --- 1. VOICE COMMAND: MARK MEDICATION AS TAKEN ---
      if (
        (lower.includes('mark') || lower.includes('took') || lower.includes('taken') || lower.includes('done')) &&
        (lower.includes('medicine') || lower.includes('pill') || lower.includes('dose') || medications.some(m => lower.includes(m.name.toLowerCase().split(' ')[0])))
      ) {
        // Find matching medication
        const matchedMed = medications.find((m) =>
          lower.includes(m.name.toLowerCase().split(' ')[0]) ||
          (lower.includes('morning') && m.scheduledTime.includes('AM')) ||
          (lower.includes('evening') && m.scheduledTime.includes('PM')) ||
          (lower.includes('night') && m.scheduledTime.includes('PM'))
        );

        if (matchedMed) {
          if (matchedMed.status !== 'taken') {
            await toggleMedicationStatus(matchedMed.id);
            botReply = `I have marked your ${matchedMed.name} (${matchedMed.dosage}) as taken! Your adherence streak is now updated to ${streakDays + 1} days.`;
            actionLabel = `Checked ${matchedMed.name} as taken`;
          } else {
            botReply = `Your ${matchedMed.name} was already marked as taken today! You are all set.`;
          }
        } else {
          // If user just said "I took my medicine", pick the next pending one
          const nextPending = medications.find((m) => m.status !== 'taken');
          if (nextPending) {
            await toggleMedicationStatus(nextPending.id);
            botReply = `I marked your next scheduled dose, ${nextPending.name} (${nextPending.dosage}), as taken! Great job keeping your adherence streak.`;
            actionLabel = `Checked ${nextPending.name} as taken`;
          } else {
            botReply = "All your scheduled medications for today are already marked as taken!";
          }
        }
      }

      // --- 2. VOICE COMMAND: WHAT MEDICATIONS ARE PENDING / DUE ---
      else if (
        (lower.includes('pending') || lower.includes('due') || lower.includes('left') || lower.includes('what medicine') || lower.includes('which medicine')) &&
        (lower.includes('pill') || lower.includes('medication') || lower.includes('medicine') || lower.includes('today'))
      ) {
        const pending = medications.filter((m) => m.status !== 'taken');
        if (pending.length > 0) {
          const list = pending.map((p) => `${p.name} at ${p.scheduledTime} (${p.foodRelation})`).join(', ');
          botReply = `You have ${pending.length} medication${pending.length > 1 ? 's' : ''} left today: ${list}. Please remember to take them on schedule.`;
        } else {
          botReply = "Wonderful news! You have taken all your scheduled medications for today. Your streak is completely protected!";
        }
      }

      // --- 3. VOICE COMMAND: CHECK STREAK ---
      else if (lower.includes('streak') || lower.includes('adherence')) {
        botReply = `Your adherence streak is currently ${streakDays} continuous days! Keeping this streak unbroken protects your health and avoids alert emails to your caregivers.`;
      }

      // --- 4. VOICE COMMAND: CHECK VITALS / HEALTH STATS ---
      else if (
        lower.includes('blood pressure') ||
        lower.includes('vital') ||
        lower.includes('heart rate') ||
        lower.includes('sugar') ||
        lower.includes('pulse')
      ) {
        const bp = profile?.vitalSigns.bloodPressure || '124/82 mmHg';
        const hr = profile?.vitalSigns.heartRate || 72;
        const sugar = profile?.vitalSigns.bloodSugar || '110 mg/dL';
        botReply = `Here are your current vital signs: Blood pressure is ${bp}, heart rate is ${hr} beats per minute, and blood sugar is ${sugar}. All indicators are currently within stable range.`;
      }

      // --- 5. VOICE COMMAND: WEBSITE NAVIGATION ---
      else if (
        lower.includes('go to') ||
        lower.includes('open') ||
        lower.includes('show') ||
        lower.includes('navigate')
      ) {
        if (lower.includes('exercise') || lower.includes('workout') || lower.includes('yoga') || lower.includes('walk')) {
          navigate(ROUTES.EXERCISES);
          botReply = "Navigating to your Daily Exercise & Physical Routine page.";
          actionLabel = "Opened Exercises Page";
        } else if (lower.includes('medication') || lower.includes('prescription') || lower.includes('schedule')) {
          navigate(ROUTES.MEDICATIONS);
          botReply = "Opening your Prescribed Medications Schedule page.";
          actionLabel = "Opened Medications Page";
        } else if (lower.includes('dashboard') || lower.includes('home')) {
          navigate(ROUTES.DASHBOARD);
          botReply = "Taking you back to your main Patient Dashboard.";
          actionLabel = "Opened Dashboard";
        } else if (lower.includes('caregiver') || lower.includes('family') || lower.includes('doctor') || lower.includes('emergency')) {
          navigate(ROUTES.CAREGIVERS);
          botReply = "Opening your Authorized Caregivers & Family Circle page.";
          actionLabel = "Opened Caregivers Page";
        }
      }

      // --- 6. VOICE COMMAND: MARK EXERCISE AS COMPLETED ---
      else if (
        (lower.includes('finished') || lower.includes('completed') || lower.includes('did')) &&
        (lower.includes('walk') || lower.includes('yoga') || lower.includes('breathing') || lower.includes('exercise'))
      ) {
        const nextExercise = exercises.find((e) => !e.completed);
        if (nextExercise) {
          await toggleExerciseStatus(nextExercise.id);
          botReply = `Great job! I have marked your "${nextExercise.title}" as completed. Consistent gentle activity supports healthy circulation.`;
          actionLabel = `Checked ${nextExercise.title} as completed`;
        } else {
          botReply = "You have already completed all your prescribed physical routines for today!";
        }
      }

      // --- 7. GENERAL HEALTH / CLINICAL QUESTION (Dr. Gemini Backend) ---
      if (!botReply) {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch('http://localhost:5000/api/chatbot/ask', {
            method: 'POST',
            headers,
            body: JSON.stringify({ question: userText }),
          });

          if (response.ok) {
            const data = await response.json();
            botReply = data.answer;
          } else {
            const errData = await response.json().catch(() => ({}));
            console.warn('Backend chatbot returned error:', response.status, errData);
            if (errData.message && errData.message.includes('API key')) {
              botReply = `Gemini connection notice: ${errData.message}. Please verify your GEMINI_API_KEY.`;
            }
          }
        } catch (fetchErr) {
          console.warn('Fetch to chatbot failed (backend offline?):', fetchErr);
        }

        if (!botReply) {
          if (lower.includes('exercise')) {
            const done = exercises.filter((e) => e.completed);
            botReply = `You have completed ${done.length} of ${exercises.length} prescribed exercises today. Keep moving to maintain mobility!`;
          } else {
            botReply = `Regarding your query "${userText}": Please ensure you maintain steady hydration and follow the dosage timing prescribed by your physician. For specific symptom changes, consult Dr. Miller. (Note: Ensure the backend API server is running on port 5000 to connect with live Gemini AI).`;
          }
        }
      }

      // Display bot response
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: actionLabel || undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);

      if (actionLabel) {
        setActionAlert(actionLabel);
      }

      // Speak answer aloud if voice mode or not muted
      speakText(botReply);
    },
    [medications, exercises, streakDays, profile, token, toggleMedicationStatus, toggleExerciseStatus, navigate]
  );

  const { isListening, isSpeaking, transcript, isSupported, startListening, stopListening, speakText, stopSpeaking } =
    useVoiceAssistant({
      onTranscript: (spokenText) => {
        if (spokenText) {
          processQuery(spokenText, true);
        }
      },
      isMuted,
    });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    const text = inputMessage.trim();
    setInputMessage('');
    await processQuery(text, false);
  };

  const handleVoiceButtonClick = () => {
    setIsOpen(true);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sampleVoicePrompts = [
    'I took my Metformin',
    'What pills are due today?',
    'What is my adherence streak?',
    'Check my blood pressure',
    'Go to exercises',
  ];

  return (
    <>
      {/* Floating Trigger Button (Dual Mode: Voice & Chat) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          {/* Quick Voice Assistant Mic Button for Seniors */}
          {isSupported && (
            <button
              onClick={handleVoiceButtonClick}
              title="Speak with Dr. Gemini"
              className="flex items-center gap-2 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-4 py-3 rounded-full shadow-2xl shadow-emerald-600/40 font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95 group border-2 border-white/30"
            >
              <div className="p-1 rounded-full bg-white/20 animate-pulse">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:inline">🎙️ Tap to Speak</span>
              <span className="sm:hidden">Speak</span>
            </button>
          )}

          {/* Standard Chatbot Open Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-4 py-3 rounded-full shadow-xl border border-slate-200 font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Bot className="w-5 h-5 text-emerald-600" />
            <span>Dr. Gemini</span>
          </button>
        </div>
      )}

      {/* Main Chat & Voice Assistant Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                {isListening ? (
                  <Mic className="w-6 h-6 animate-pulse text-amber-300" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold leading-tight">Dr. Gemini AI</h3>
                  <span className="bg-emerald-400/30 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase">
                    Voice & Care
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90">Elderly Voice Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Sound Toggle Button (Mute/Unmute) */}
              <button
                onClick={() => {
                  if (!isMuted) stopSpeaking();
                  setIsMuted(!isMuted);
                }}
                title={isMuted ? 'Unmute voice speech' : 'Mute voice speech'}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-200" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  stopListening();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Voice Listening Ripple Banner */}
          {isListening && (
            <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 p-3 text-white text-xs flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-200"></span>
                </span>
                <span className="font-bold">Listening to you... Speak now!</span>
              </div>
              <button
                onClick={stopListening}
                className="bg-white/20 hover:bg-white/30 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Dr. Gemini Speaking Banner */}
          {isSpeaking && !isMuted && (
            <div className="bg-teal-700 px-3 py-1.5 text-white text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Dr. Gemini is speaking...</span>
              </div>
              <button
                onClick={stopSpeaking}
                className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded hover:bg-white/30"
              >
                Stop
              </button>
            </div>
          )}

          {/* Live Recognized Speech Transcript Bubble */}
          {transcript && isListening && (
            <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100 text-xs text-emerald-900 italic flex items-center gap-2">
              <span className="font-semibold text-emerald-700">Heard:</span>
              <span>"{transcript}"</span>
            </div>
          )}

          {/* Action Confirmation Banner */}
          {actionAlert && (
            <div className="bg-emerald-100/80 px-3 py-1.5 border-b border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{actionAlert}</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.actionTaken && (
                    <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{msg.actionTaken}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 italic text-xs py-1">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Dr. Gemini is processing your health request...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Command Prompts for Seniors */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {sampleVoicePrompts.map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => processQuery(cmd, false)}
                className="whitespace-nowrap bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                <span>"{cmd}"</span>
              </button>
            ))}
          </div>

          {/* Input & Big Mic Controls */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            {/* Big Voice Button */}
            {isSupported && (
              <button
                type="button"
                onClick={handleVoiceButtonClick}
                title={isListening ? 'Stop listening' : 'Start voice command'}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-400/40 ring-2 ring-rose-400'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? 'Listening to voice...' : 'Speak or type your health question...'}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
