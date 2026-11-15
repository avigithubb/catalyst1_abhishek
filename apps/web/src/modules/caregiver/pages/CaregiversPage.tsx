import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, UserCheck, Lock, UserPlus, PhoneCall, Mail } from 'lucide-react';
import { useHealthcare } from '@/context/HealthcareContext';

export const CaregiversPage: React.FC = () => {
  const { profile } = useHealthcare();

  const members = [
    { name: 'Sarah Harrison', role: 'Daughter / Primary Caregiver', email: 'sarah.harrison@family.org', phone: '+1 (555) 234-8976', access: 'Admin / Full Access' },
    { name: 'Dr. Arthur Miller', role: 'Geriatric Physician', email: 'dr.miller@hospital.org', phone: '+1 (555) 432-1098', access: 'Medical / Prescriptions' },
    { name: 'Marcus Vance, RN', role: 'Home Visiting Nurse', email: 'marcus.v@careplus.org', phone: '+1 (555) 789-3210', access: 'Caregiver / Vitals' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shared Caregiver Circle & Family Access</h2>
          <p className="text-xs text-slate-500 mt-1">
            Authorized contacts who have authenticated shared access to view, update, and manage medications.
          </p>
        </div>
        <Button variant="primary" size="sm">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Authorize New Caregiver
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900">
          <span className="font-bold">Shared Passcode Protected:</span> All members access this single patient's dossier through authenticated sessions backed by bcrypt hashing and shared family passcode <span className="font-mono font-bold bg-amber-100 px-1 rounded">{profile?.accessPasscode || '2026'}</span>.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {members.map((m, idx) => (
          <Card key={idx} className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-3">
                {m.name.charAt(0)}
              </div>
              <h4 className="text-sm font-bold text-slate-800">{m.name}</h4>
              <p className="text-xs text-emerald-700 font-medium">{m.role}</p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-400">{m.access}</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
