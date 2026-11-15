import React from 'react';
import { useHealthcare } from '@/context/HealthcareContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pill, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const MedicationsPage: React.FC = () => {
  const { medications, toggleMedicationStatus } = useHealthcare();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Prescribed Medications Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete schedule, food guidelines, and adherence tracking for Robert Harrison.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => (
          <Card key={med.id} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${med.status === 'taken' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{med.name}</h4>
                  <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                med.status === 'taken' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {med.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {med.instructions}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{med.scheduledTime} ({med.foodRelation})</span>
              </div>
              <Button
                variant={med.status === 'taken' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggleMedicationStatus(med.id)}
              >
                {med.status === 'taken' ? 'Mark Pending' : 'Mark as Taken'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
