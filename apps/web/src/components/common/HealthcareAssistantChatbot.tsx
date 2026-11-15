import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, AlertCircle, HeartPulse, Minimize2, Maximize2 } from 'lucide-react';
import { useHealthcare } from '@/context/HealthcareContext';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const HealthcareAssistantChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { profile, medications, exercises, streakDays } = useHealthcare();
  const { token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: "Hello! I am Dr. Gemini, your dedicated medical & adherence assistant. I can answer questions regarding health, medicines, symptoms, or summarize your daily medication and exercise progress on ElderCare Connect. How can I help you today?",
      time: 'Just now',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let botReply = '';

      if (token) {
        // Query backend Gemini endpoint with live database grounding
        const response = await fetch('http://localhost:5000/api/chatbot/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question: userText }),
        });

        if (response.ok) {
          const data = await response.json();
          botReply = data.answer;
        }
      }

      // Offline / fallback response generator if backend is not currently running
      if (!botReply) {
        const lower = userText.toLowerCase();

        // 1. Check if user is asking about exercises
        if (lower.includes('exercise') || lower.includes('workout') || lower.includes('walk') || lower.includes('yoga')) {
          const done = exercises.filter(e => e.completed);
          botReply = `You have completed ${done.length} out of ${exercises.length} prescribed exercises today. ${
            done.length > 0 
              ? `Completed: ${done.map(d => d.title).join(', ')}.` 
              : 'You have not marked any exercises as completed yet.'
          } Keep moving to maintain your mobility and cardiovascular strength!`;
        } 
        // 2. Check if user is asking about medications / pills
        else if (lower.includes('medication') || lower.includes('pill') || lower.includes('dose') || lower.includes('medicine')) {
          const taken = medications.filter(m => m.status === 'taken');
          const pending = medications.filter(m => m.status !== 'taken');
          botReply = `Today you have taken ${taken.length} of ${medications.length} scheduled medications. ${
            pending.length > 0
              ? `Still pending: ${pending.map(p => `${p.name} (${p.scheduledTime})`).join(', ')}.`
              : 'All scheduled doses for today are marked as taken!'
          }`;
        }
        // 3. Check if user is asking about streak
        else if (lower.includes('streak')) {
          botReply = `Your current adherence streak is ${streakDays} days! Keeping this streak unbroken protects your health and prevents alert emails to your caregivers.`;
        }
        // 4. Check if question is completely non-medical
        else if (
          lower.includes('weather') || lower.includes('joke') || lower.includes('president') || 
          lower.includes('code') || lower.includes('football') || lower.includes('movie')
        ) {
          botReply = "I am Dr. Gemini, your dedicated healthcare and medication assistant. I am restricted to answering questions related to medical health, medication guidelines, wellness, and your daily health activity on this platform.";
        }
        // 5. Default healthcare assistance
        else {
          botReply = `Regarding your query "${userText}": Please ensure you maintain steady hydration and follow the dosage timing prescribed by your physician. For specific symptoms, consult Dr. Miller or your visiting nurse.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: "I am having temporary trouble contacting the clinical AI service. Please verify your connection or consult your caregiver directly.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "How many exercises did I do today?",
    "Which medications are still due?",
    "Can Metformin cause stomach upset?",
    "What is my current adherence streak?"
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-3 rounded-full shadow-2xl shadow-emerald-600/30 font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
        >
          <div className="p-1 rounded-full bg-white/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <span>Ask Dr. Gemini AI</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold leading-tight">Dr. Gemini AI</h3>
                  <span className="bg-emerald-400/30 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase">
                    Medical Bot
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80">Clinical & Adherence Guide</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Safety Notice Banner */}
          <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Strict medical & platform activity answers only.</span>
          </div>

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
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 italic text-xs py-1">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Dr. Gemini is analyzing medical context...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputMessage(q)}
                className="whitespace-nowrap bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about medications, exercises, vitals..."
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
