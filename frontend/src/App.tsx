import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { Activity, Heart, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: string;
}

interface Caregiver {
  id: number;
  name: string;
  email: string;
}

function HomePage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<HealthData>('/health')
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to backend');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between p-6 max-w-4xl mx-auto">
      <header className="py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#167C53] flex items-center justify-center text-white font-bold text-xl">
              द
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#202824]">DawaReminder</h1>
              <p className="text-xs text-[#5C6863]">दवाई रिमाइंडर — Family configures. Elderly follows.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/app"
              className="px-4 py-2 bg-[#167C53] text-white rounded-lg text-sm font-medium hover:bg-[#0D4E34] transition"
            >
              Caregiver Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="my-10 space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-[#202824] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#167C53]" /> System Foundation Status (Stage 0)
          </h2>
          {loading && <p className="text-sm text-gray-500">Checking backend and database connectivity...</p>}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Backend Unreachable</p>
                <p className="text-xs">{error}</p>
                <p className="text-xs mt-1 text-gray-600">Ensure the backend server is running on port 8000.</p>
              </div>
            </div>
          )}
          {health && (
            <div className="space-y-3">
              <div className="p-4 bg-[#E9F5EF] border border-[#167C53]/30 rounded-xl flex items-center justify-between text-[#0D4E34] text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#167C53]" />
                  <span className="font-medium">Backend Service: {health.service} v{health.version}</span>
                </div>
                <span className="px-2 py-1 text-xs bg-[#167C53] text-white rounded-full font-semibold uppercase">
                  {health.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500">Environment:</span>{' '}
                  <span className="font-semibold text-gray-800">{health.environment}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500">Database Engine:</span>{' '}
                  <span className="font-semibold text-gray-800">{health.database}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#167C53] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">Caregiver Dashboard</h3>
            <p className="text-sm text-gray-600">
              Manage patient profiles, medication schedules, dosage timings, and live adherence monitoring.
            </p>
            <Link
              to="/app"
              className="inline-block pt-2 text-[#167C53] font-semibold text-sm hover:underline"
            >
              Open Caregiver App &rarr;
            </Link>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">Patient Interface</h3>
            <p className="text-sm text-gray-600">
              Accessible, large-type, passwordless view designed for elderly patients with simple Taken/Skipped actions.
            </p>
            <Link
              to="/p/demo-patient"
              className="inline-block pt-2 text-[#167C53] font-semibold text-sm hover:underline"
            >
              Preview Patient View &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">This is a reminder tool, not medical advice.</p>
        <p>DawaReminder &copy; 2026 — HMASS Internal College Project</p>
      </footer>
    </div>
  );
}

function CaregiverShell() {
  const [user, setUser] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Caregiver>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="min-h-screen grid place-items-center text-lg text-gray-600">Loading your account...</main>;
  }
  if (!user) return <Navigate to="/login" replace />;

  const logout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-xl font-bold text-[#167C53]">Caregiver Dashboard</h1>
          <p className="text-sm text-gray-600">Signed in as {user.name}</p>
        </div>
        <button onClick={logout} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white">Log out</button>
      </div>
      <div className="p-8 bg-white border rounded-2xl text-center space-y-2">
        <p className="font-semibold text-gray-700">Your account is ready</p>
        <p className="text-sm text-gray-500">Patient and medicine management are the next project stage.</p>
      </div>
    </div>
  );
}

function AuthPage({ initialRegister = false }: { initialRegister?: boolean }) {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(initialRegister);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiRequest<Caregiver>(registering ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(registering ? { name, email, password } : { email, password }),
      });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : (err as { message?: string }).message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-5 py-10 grid place-items-center">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
        <Link to="/" className="text-sm text-[#167C53] hover:underline">← DawaReminder</Link>
        <h1 className="mt-5 text-2xl font-bold text-[#202824]">{registering ? 'Create caregiver account' : 'Caregiver sign in'}</h1>
        <p className="mt-2 text-gray-600">Manage medication routines for your family.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {registering && (
            <label className="block text-sm font-medium text-gray-700">Your name
              <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-3 text-base" />
            </label>
          )}
          <label className="block text-sm font-medium text-gray-700">Email
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-3 text-base" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Password
            <input required type="password" minLength={10} autoComplete={registering ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-3 text-base" />
            {registering && <span className="mt-1 block text-xs font-normal text-gray-500">Use at least 10 characters.</span>}
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={submitting} className="w-full rounded-lg bg-[#167C53] px-4 py-3 text-base font-semibold text-white hover:bg-[#0D4E34] disabled:opacity-60">
            {submitting ? 'Please wait...' : registering ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <button onClick={() => { setRegistering(!registering); setError(''); }} className="mt-5 min-h-11 text-sm text-[#167C53] hover:underline">
          {registering ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </section>
    </main>
  );
}

function PatientShell() {
  const { token } = useParams<{ token: string }>();
  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-xl font-bold text-[#167C53]">दवाई रिमाइंडर (Patient View)</h1>
        <Link to="/" className="text-xs text-gray-500 hover:underline">Home</Link>
      </div>
      <div className="p-8 bg-white border rounded-2xl text-center space-y-3">
        <p className="text-xs text-gray-500">Access Token: <code className="bg-gray-100 px-2 py-0.5 rounded">{token}</code></p>
        <h2 className="text-2xl font-bold text-gray-800">आज की दवाइयाँ (Today&apos;s Doses)</h2>
        <p className="text-sm text-gray-500">Large buttons and voice instructions will be connected in Stage 4.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage initialRegister />} />
        <Route path="/app/*" element={<CaregiverShell />} />
        <Route path="/p/:token" element={<PatientShell />} />
      </Routes>
    </BrowserRouter>
  );
}
