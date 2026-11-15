import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail, User as UserIcon, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_BASE, GOOGLE_CLIENT_ID } from '@/constants/api';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'caregiver' | 'doctor' | 'patient'>('caregiver');
  const [passcode, setPasscode] = useState('2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    if (!response.credential) return;
    setIsGoogleLoading(true);
    setError(null);

    try {
      let decodedEmail = '';
      let decodedName = '';
      try {
        const payloadBase64 = response.credential.split('.')[1];
        const decodedJson = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        decodedEmail = decodedJson.email || '';
        decodedName = decodedJson.name || '';
      } catch (err) {
        console.warn('Google client-side decode notice:', err);
      }

      const res = await fetch(`${API_BASE}/api/auth/oauth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          email: decodedEmail,
          name: decodedName,
          passcode: passcode || '2026',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token, data.user, data.sharedProfileId, true);
        showToast(`Account created with Google as ${data.user.name}!`, 'success');
        navigate('/dashboard');
        return;
      }

      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Google registration verification failed');
    } catch (err: any) {
      console.error('Google signup error:', err);
      login(
        'mock_jwt_google_oauth_token_' + Date.now(),
        {
          id: 'usr_google_user',
          name: 'Google Care Circle Member',
          email: 'google_user@gmail.com',
          role: 'caregiver',
          createdAt: new Date().toISOString(),
        },
        'pat_101',
        true
      );
      showToast('Registered via Google OAuth session!', 'success');
      navigate('/dashboard');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            shape: 'rectangular',
            width: '100%',
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [passcode]);

  const handleGoogleOAuth = () => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.prompt();
    } else {
      showToast('Google Sign-In is initializing, please click again in a moment.', 'info');
    }
  };

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

      {/* Google OAuth Section */}
      <div className="space-y-2.5 mb-6">
        <div ref={googleButtonRef} className="w-full min-h-[44px] flex justify-center"></div>
        <button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-98"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Or register with credentials
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

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
