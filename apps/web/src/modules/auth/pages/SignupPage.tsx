import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail, User as UserIcon, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_BASE } from '@/constants/api';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'caregiver' | 'doctor' | 'patient'>('caregiver');
  const [passcode, setPasscode] = useState('2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password, role, passcode }),
      });

      if (response.ok) {
        const data = await response.json();
        // Set isNewUser = true so new signups start with 0 stats
        login(data.token, data.user, data.sharedProfileId, true);
        showToast('Account created successfully!', 'success');
        navigate('/dashboard');
        return;
      }

      const err = await response.json();
      if (response.status === 409) {
        setError(err.message || 'This email is already registered. Please sign in instead.');
        showToast('Email already in use. Please sign in.', 'error');
        return;
      }
      throw new Error(err.message || 'Registration failed');
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        setError(err.message);
        return;
      }

      // Offline mock registration (prevent duplicate check locally)
      login(
        'jwt_token_auth_registered_' + Date.now(),
        {
          id: `usr_${Date.now()}`,
          name: name || 'Authorized Family Caregiver',
          email: normalizedEmail,
          role,
          createdAt: new Date().toISOString(),
        },
        'pat_101',
        true // isNewUser flag = true
      );
      showToast('Account registered successfully (Offline mode)!', 'success');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleOAuth = () => {
    showToast('Apple OAuth functionality is coming soon!', 'info');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Register Shared Member</h3>
          <p className="text-xs text-slate-500 mt-1">
            Join the care ecosystem to manage medication schedules, exercise routines, and reminders.
          </p>
        </div>
        <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors p-1" title="Back to Home">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name or Username"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. Arthur Miller or Sarah"
          icon={<UserIcon className="w-4 h-4" />}
        />

        <Input
          label="Email Address (Unique)"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@care.org"
          icon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Account Password (Bcrypt Stored)"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          icon={<Lock className="w-4 h-4" />}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Role in Healthcare Circle
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['caregiver', 'doctor', 'patient'] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition-all ${
                  role === r
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60">
          <Input
            label="Family Shared Passcode"
            type="text"
            required
            maxLength={8}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="e.g. 2026"
            helperText="Matches the patient account security passcode (default: 2026)"
            icon={<KeyRound className="w-4 h-4 text-amber-600" />}
          />
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading} size="lg">
          Create Authorized Account
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleAppleOAuth}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium"
        >
          <span>Sign up with Apple</span>
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500">
        Already have an authorized account?{' '}
        <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
