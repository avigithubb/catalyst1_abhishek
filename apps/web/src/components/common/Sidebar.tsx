import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  Activity, 
  Users, 
  Calendar, 
  Settings, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useHealthcare } from '@/context/HealthcareContext';

export const Sidebar: React.FC = () => {
  const { streakDays } = useHealthcare();

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Medications', to: '/medications', icon: Pill },
    { label: 'Daily Exercises', to: '/exercises', icon: Activity },
    { label: 'Care Team & Family', to: '/caregivers', icon: Users },
    { label: 'Doctor Visits', to: '/appointments', icon: Calendar },
    { label: 'Security & Access', to: '/security', icon: ShieldAlert },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Streak highlight card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-50 rounded-2xl p-4 border border-amber-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
              <Flame className="w-5 h-5 fill-white animate-bounce" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Health Streak</p>
              <h4 className="text-xl font-extrabold text-amber-950">{streakDays} Days Strong</h4>
            </div>
          </div>
          <p className="text-[11px] text-amber-700/80 mt-2">
            No doses missed today. Keep the streak active to stay healthy!
          </p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Safety & Protocol Card */}
      <div className="p-4">
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-500 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Automated Escalation</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Missed medication alerts automatically notify the entire care circle after 2 overdue days.
          </p>
        </div>
      </div>
    </aside>
  );
};
