import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  Pill, 
  Flame, 
  Users, 
  Activity, 
  ShieldCheck, 
  BellRing, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  PhoneCall,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-xl">ElderCare Connect</span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Platform
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart Elderly Healthcare & Medication Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="md">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="md">
                Join Care Circle
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Empowering Elderly Health & Independence
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              A Connected Care Ecosystem for Our Loved Ones.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              ElderCare Connect bridges seniors, family caretakers, and doctors into a unified, passcode-protected hub. Manage daily prescriptions, track vital signs, celebrate adherence streaks, and maintain physical wellness routines with complete peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <span>Enter Shared Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Register as Caregiver
                </Button>
              </Link>
            </div>

            {/* Quick credential hint banner */}
            <div className="pt-6">
              <div className="inline-block bg-white border border-slate-200/80 rounded-2xl p-3 px-5 text-xs text-slate-500 shadow-sm">
                <span className="font-bold text-slate-800">Quick Test Credentials:</span> Email: <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-bold">caregiver@family.org</code> | Password: <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-bold">Password@123</code> | Passcode: <code className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-bold">2026</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars: How Elderly Individuals Stay Healthy */}
      <section className="bg-white py-16 lg:py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Seniors & Families Utilize This Platform
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              Designed with large typography, gentle contrast, and effortless one-click interactions tailored specifically for seniors and their care teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Medication Adherence */}
            <div className="bg-slate-50/80 rounded-3xl p-8 border border-slate-100 space-y-4 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Pill className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Visual Medication Checklist</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Clear morning, afternoon, and evening dosage schedules with clear food instructions ("After Food", "With Water"). One tap marks the medication as taken and records the time.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Real-time sync across all caretakers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Prevents accidental double-dosing</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Motivation & Streaks */}
            <div className="bg-slate-50/80 rounded-3xl p-8 border border-slate-100 space-y-4 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Flame className="w-7 h-7 fill-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Health Streak & Accountability</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Celebrating daily consistency! Seniors feel motivated through unbroken adherence streaks. If a dose is left overdue for yesterday, an automated reminder is sent and the streak resets.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span>Single-day reminder email to patient</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span>Critical 2+ day alert to entire family</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Physical Therapy & Exercises */}
            <div className="bg-slate-50/80 rounded-3xl p-8 border border-slate-100 space-y-4 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Daily Exercise & Wellness</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Health goes beyond pills. Track senior-tailored mobility exercises, chair yoga, morning garden walks, and Pranayama breathing routines to maintain vitality and lung capacity.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span>Low-impact routines prescribed by doctors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span>Track daily completion progress</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Multi-user Shared Circle */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-emerald-900 to-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Shared Passcode Access
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                One Shared Profile, Protected for Your Whole Family.
              </h2>
              <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
                Rather than isolated accounts, ElderCare Connect maintains an interconnected shared dossier. Authorized family members, visiting nurses, and doctors authenticate securely with their credentials and shared passcode.
              </p>

              <div className="space-y-3 pt-2 text-sm text-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs">✓</div>
                  <span><strong>Zero Prop Drilling:</strong> Global React Context API managing session and real-time medical logs.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs">✓</div>
                  <span><strong>ACID Compliant:</strong> Atomic transactions prevent race conditions during dose confirmations.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs">✓</div>
                  <span><strong>N+1 Vulnerability Immune:</strong> High-performance relational single-query batch joins.</span>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="bg-white text-emerald-950 hover:bg-emerald-50">
                    Sign In to Portal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-emerald-950/60 p-8 rounded-3xl border border-emerald-800/60 space-y-6 shadow-2xl">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-400" />
                <span>Automated Escalation Protocol</span>
              </h4>
              <div className="space-y-4 text-xs text-emerald-200/90 leading-relaxed">
                <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-700/50">
                  <strong className="text-amber-300 block text-sm mb-1">Level 1: 1-Day Missed Notice</strong>
                  If a dose is left overdue for yesterday, an automated reminder is sent only to the patient with the specific list of missed pills, and the streak resets to 0.
                </div>
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40">
                  <strong className="text-rose-300 block text-sm mb-1">Level 2: 2+ Days Overdue Emergency Alert</strong>
                  If 2 or more consecutive days are missed, the system immediately emails all authorized caregivers and doctors with urgent intervention instructions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ElderCare Connect Platform. Built for elderly care & medication adherence.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-emerald-600">Sign In</Link>
            <span>•</span>
            <Link to="/signup" className="hover:text-emerald-600">Sign Up</Link>
            <span>•</span>
            <Link to="/security" className="hover:text-emerald-600">Security Audit</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
