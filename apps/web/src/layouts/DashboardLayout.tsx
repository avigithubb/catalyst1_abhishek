import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { HealthcareAssistantChatbot } from '@/components/common/HealthcareAssistantChatbot';
import { useHealthcare } from '@/context/HealthcareContext';
import { AlertTriangle, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { alertBannerMessage } = useHealthcare();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Dynamic Global Adherence Banner */}
      {alertBannerMessage && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>{alertBannerMessage}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Dr. Gemini AI Chatbot — floating overlay */}
      <HealthcareAssistantChatbot />
    </div>
  );
};
