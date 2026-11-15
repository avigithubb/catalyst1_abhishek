import React from 'react';
import { useHealthcare } from '@/context/HealthcareContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dumbbell, Activity, Flame, CheckCircle, Clock } from 'lucide-react';

export const ExercisesPage: React.FC = () => {
  const { exercises, toggleExerciseStatus } = useHealthcare();
  const completedCount = exercises.filter((e) => e.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daily Physical Activity & Wellness</h2>
          <p className="text-xs text-slate-500 mt-1">
            Low-impact exercises customized for senior mobility, balance, and respiratory health.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-4 py-2 rounded-2xl text-xs font-bold text-indigo-900">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Progress: {completedCount} / {exercises.length} Completed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exercises.map((ex) => (
          <Card key={ex.id} className={`flex flex-col justify-between ${ex.completed ? 'border-indigo-200 bg-indigo-50/20' : ''}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {ex.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">{ex.durationMinutes} mins</span>
              </div>
              <h3 className={`mt-3 text-base font-bold ${ex.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {ex.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2">{ex.instructions}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {ex.scheduledTime}
              </span>
              <Button
                variant={ex.completed ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => toggleExerciseStatus(ex.id)}
              >
                {ex.completed ? 'Mark Incomplete' : 'Complete Routine'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
