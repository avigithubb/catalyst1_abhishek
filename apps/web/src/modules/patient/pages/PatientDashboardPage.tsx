import React, { useState, useMemo, useCallback } from 'react';
import { useHealthcare } from '@/context/HealthcareContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { 
  HeartPulse, 
  Flame, 
  Pill, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Plus, 
  Activity, 
  Dumbbell, 
  ShieldCheck, 
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    profile, 
    medications, 
    exercises, 
    streakDays, 
    missedYesterdayCount, 
    healthCondition,
    toggleMedicationStatus, 
    toggleExerciseStatus,
    addMedication,
    triggerAdherenceCronCheck
  } = useHealthcare();

  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [isSimulatingAlert, setIsSimulatingAlert] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // New Medication Form State
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [foodRelation, setFoodRelation] = useState<'Before Food' | 'After Food' | 'With Food'>('After Food');
  const [instructions, setInstructions] = useState('');

  // Memoized derived calculations to avoid re-computing on unrelated renders
  const takenMedsCount = useMemo(() => medications.filter(m => m.status === 'taken').length, [medications]);
  const totalMedsCount = useMemo(() => medications.length, [medications]);
  const completedExercisesCount = useMemo(() => exercises.filter(e => e.completed).length, [exercises]);

  const handleCreateMedication = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !dosage) return;

    await addMedication({
      name: medName,
      dosage,
      frequency,
      scheduledTime,
      foodRelation,
      instructions: instructions || 'Take with water as prescribed'
    });

    setMedName('');
    setDosage('');
    setInstructions('');
    setIsAddMedModalOpen(false);
  }, [medName, dosage, frequency, scheduledTime, foodRelation, instructions, addMedication]);

  const handleRunAlertCheck = useCallback(async () => {
    setIsSimulatingAlert(true);
    setSimulationResult(null);
    const res = await triggerAdherenceCronCheck();
    setSimulationResult(res.message);
    setIsSimulatingAlert(false);
  }, [triggerAdherenceCronCheck]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome & Patient Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 text-xl font-bold shadow-inner">
            {profile?.fullName ? profile.fullName.charAt(0) : 'R'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{profile?.fullName || 'Robert Harrison'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Shared Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>Age: {profile?.age || 74} yrs</span>
              <span>•</span>
              <span>Blood Group: {profile?.bloodGroup || 'O+'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Logged as: {user?.name} ({user?.role})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRunAlertCheck}
            isLoading={isSimulatingAlert}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Check Missed & Send Alerts
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setIsAddMedModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Medication
          </Button>
        </div>
      </div>

      {simulationResult && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800 flex items-start gap-2.5 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Email Notification Engine Triggered:</span>
            <p className="mt-0.5">{simulationResult}</p>
          </div>
        </div>
      )}

      {/* Primary KPI Grid: Current Health, Reminders & Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Condition */}
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Health</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-800">{healthCondition}</div>
            <p className="text-xs text-slate-500 mt-1">BP: {profile?.vitalSigns.bloodPressure} | Sugar: {profile?.vitalSigns.bloodSugar}</p>
          </div>
        </Card>

        {/* Adherence Streak */}
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adherence Streak</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-600">{streakDays} Days</div>
            <p className="text-xs text-slate-500 mt-1">
              {missedYesterdayCount === 0 ? 'Streak intact! No misses yesterday.' : 'Streak warning active.'}
            </p>
          </div>
        </Card>

        {/* Daily Medication Checklist Summary */}
        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Doses</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-teal-700">
              {takenMedsCount} / {totalMedsCount}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-teal-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${totalMedsCount ? (takenMedsCount / totalMedsCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Daily Exercise Progress */}
        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exercise Routine</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-indigo-700">
              {completedExercisesCount} / {exercises.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Light physical & breathing therapy</p>
          </div>
        </Card>
      </div>

      {/* Main Section: Daily Medication Checklist with Action Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card 
            title="Today's Medication Checklist" 
            subtitle="Mark doses as taken or pending. Changes update in real-time for all caregivers."
            action={
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {takenMedsCount === totalMedsCount && totalMedsCount > 0 ? 'All Completed 🎉' : `${totalMedsCount - takenMedsCount} Remaining`}
              </span>
            }
          >
            <div className="divide-y divide-slate-100">
              {medications.map((med) => {
                const isTaken = med.status === 'taken';
                return (
                  <div 
                    key={med.id} 
                    className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isTaken ? 'opacity-85' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleMedicationStatus(med.id)}
                        className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isTaken 
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20' 
                            : 'border-2 border-slate-300 hover:border-emerald-500 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isTaken ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {med.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{med.instructions}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5" />
                            {med.scheduledTime}
                          </span>
                          <span>•</span>
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            {med.foodRelation}
                          </span>
                          {med.lastTakenAt && (
                            <span className="text-emerald-600 font-medium">
                              Taken at {med.lastTakenAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:self-center">
                      <Button
                        variant={isTaken ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => toggleMedicationStatus(med.id)}
                      >
                        {isTaken ? 'Undo Mark' : 'Mark as Taken'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Additional Activity: Daily Exercise Tracking */}
          <Card
            title="Daily Exercise & Routine"
            subtitle="Gentle physical therapy and mobility routines prescribed for elderly health."
            icon={<Dumbbell className="w-5 h-5 text-indigo-600" />}
          >
            <div className="space-y-3">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    ex.completed 
                      ? 'bg-indigo-50/40 border-indigo-200/80' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExerciseStatus(ex.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        ex.completed 
                          ? 'bg-indigo-600 text-white' 
                          : 'border border-slate-300 hover:border-indigo-500'
                      }`}
                    >
                      {ex.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold ${ex.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {ex.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ex.instructions}</p>
                      <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {ex.durationMinutes} mins • {ex.category} • {ex.scheduledTime}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={ex.completed ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => toggleExerciseStatus(ex.id)}
                  >
                    {ex.completed ? 'Done' : 'Mark Done'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Automated Reminders & Escalation Rules Info */}
        <div className="space-y-4">
          <Card 
            title="Automated Email Reminders" 
            subtitle="Rules configured for streak protection and caregiver escalation"
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          >
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-1">
                <span className="font-bold text-amber-900 block">Single-Day Miss (Yesterday Due)</span>
                <p className="text-[11px] text-amber-800">
                  If medication was left due for the previous date, the system sends an email reminder ONLY for the last missed medication list to the patient, and resets the streak.
                </p>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 space-y-1">
                <span className="font-bold text-rose-900 block">Critical 2+ Days Overdue Alert</span>
                <p className="text-[11px] text-rose-800">
                  If the patient misses more than 2 consecutive days, a high-priority alert email is instantly dispatched to all authorized family members and doctors.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-700 block">Shared Caregiver Circle</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Sarah H. (Daughter)</span>
                    <span className="text-emerald-600 font-semibold">Active Member</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Dr. Miller (Geriatrician)</span>
                    <span className="text-emerald-600 font-semibold">Active Doctor</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Marcus (Nurse Caregiver)</span>
                    <span className="text-emerald-600 font-semibold">Active Member</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Doctor Appointments Card */}
          <Card
            title="Upcoming Doctor Appointments"
            icon={<Calendar className="w-5 h-5 text-emerald-600" />}
          >
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <p className="font-bold text-slate-800">Cardiology Routine Check</p>
                <p className="text-slate-500 text-[11px]">Dr. Rachel Adams • City Heart Clinic</p>
                <p className="text-emerald-700 font-semibold text-[10px] mt-1">Thursday, Nov 19 • 10:00 AM</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <p className="font-bold text-slate-800">Endocrinology Diabetes Follow-up</p>
                <p className="text-slate-500 text-[11px]">Dr. Arthur Miller • St. Mary's</p>
                <p className="text-emerald-700 font-semibold text-[10px] mt-1">Monday, Nov 23 • 02:30 PM</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddMedModalOpen}
        onClose={() => setIsAddMedModalOpen(false)}
        title="Add New Medication"
        description="Schedule a new medication dose for the patient."
      >
        <form onSubmit={handleCreateMedication} className="space-y-3.5">
          <Input
            label="Medication Name"
            required
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            placeholder="e.g. Lisinopril"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Dosage"
              required
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 10 mg"
            />
            <Input
              label="Time"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="08:00 AM"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Food Timing
            </label>
            <select
              value={foodRelation}
              onChange={(e) => setFoodRelation(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="After Food">After Food</option>
              <option value="Before Food">Before Food</option>
              <option value="With Food">With Food</option>
            </select>
          </div>
          <Input
            label="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Take with a large glass of water"
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsAddMedModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Medication
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
