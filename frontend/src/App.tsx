import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { Caregiver, Patient, Dose } from '@/types';
import { CaregiverLayout } from '@/components/layout/CaregiverLayout';
import { DashboardView } from '@/features/caregiver/DashboardView';
import { PatientsView } from '@/features/caregiver/PatientsView';
import { MedicationsView } from '@/features/caregiver/MedicationsView';
import { HistoryView } from '@/features/caregiver/HistoryView';
import { AddPatientModal } from '@/features/caregiver/AddPatientModal';
import { AddMedicationModal } from '@/features/caregiver/AddMedicationModal';
import { ShareQrModal } from '@/features/caregiver/ShareQrModal';
import { PatientView } from '@/features/patient/PatientView';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { Activity, Shield, HeartHandshake, CheckCircle2, AlertCircle } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: string;
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
              className="px-4 py-2 bg-[#167C53] text-white rounded-xl text-sm font-semibold hover:bg-[#0D4E34] transition shadow-xs"
            >
              Caregiver Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="my-10 space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-[#202824] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#167C53]" /> System Status
          </h2>
          {loading && <p className="text-sm text-gray-500">Checking backend & database connectivity...</p>}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Backend Unreachable</p>
                <p className="text-xs">{error}</p>
                <p className="text-xs mt-1 text-gray-600">Ensure the backend server is running.</p>
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
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#167C53] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Caregiver Dashboard</h3>
            <p className="text-sm text-gray-600">
              Manage patient routines, schedule medicine timings, food instructions, and monitor live dose adherence.
            </p>
            <Link
              to="/app"
              className="inline-block pt-2 text-[#167C53] font-semibold text-sm hover:underline"
            >
              Open Caregiver Portal &rarr;
            </Link>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Elderly Patient View</h3>
            <p className="text-sm text-gray-600">
              Zero passwords, large high-contrast visual cues, voice announcements, and Hindi language support.
            </p>
            <span className="text-xs text-gray-400 block pt-2">
              (Accessible via patient secret QR code or link)
            </span>
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
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link to="/" className="text-xs font-semibold text-[#167C53] hover:underline">← Home</Link>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-9 h-9 rounded-xl bg-[#167C53] text-white flex items-center justify-center font-bold text-lg">
            द
          </div>
          <h1 className="text-2xl font-bold text-[#202824]">
            {registering ? 'Create Caregiver Account' : 'Caregiver Sign In'}
          </h1>
        </div>
        <p className="mt-2 text-xs text-gray-500">Configure and track medication routines for elderly family members.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {registering && (
            <label className="block text-xs font-bold text-gray-700">
              Full Name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#167C53]/30"
              />
            </label>
          )}
          <label className="block text-xs font-bold text-gray-700">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#167C53]/30"
            />
          </label>
          <label className="block text-xs font-bold text-gray-700">
            Password
            <input
              required
              type="password"
              minLength={8}
              autoComplete={registering ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#167C53]/30"
            />
            {registering && <span className="mt-1 block text-[11px] font-normal text-gray-500">Use at least 8 characters.</span>}
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">{error}</p>}
          <button
            disabled={submitting}
            className="w-full rounded-xl bg-[#167C53] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0D4E34] disabled:opacity-60 transition shadow-xs"
          >
            {submitting ? 'Please wait...' : registering ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <button
          onClick={() => { setRegistering(!registering); setError(''); }}
          className="mt-5 w-full text-center text-xs text-[#167C53] font-semibold hover:underline"
        >
          {registering ? 'Already have an account? Sign In' : 'New to DawaReminder? Create an Account'}
        </button>
      </section>
    </main>
  );
}

function CaregiverShell() {
  const [user, setUser] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [doses, setDoses] = useState<Dose[]>([]);

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [qrModalPatient, setQrModalPatient] = useState<Patient | null>(null);

  // 1. Fetch user profile
  useEffect(() => {
    apiRequest<Caregiver>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // 2. Fetch caregiver's patients
  const fetchPatients = async () => {
    try {
      const data = await apiRequest<Patient[]>('/patients');
      setPatients(data);
      if (data.length > 0 && !activePatient) {
        setActivePatient(data[0]);
      }
    } catch {
      // Ignored if unauthorized
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  // 3. Fetch doses for active patient
  const fetchDoses = async () => {
    if (!activePatient) {
      setDoses([]);
      return;
    }
    try {
      const data = await apiRequest<Dose[]>(`/patients/${activePatient.id}/doses`);
      setDoses(data);
    } catch {
      setDoses([]);
    }
  };

  useEffect(() => {
    fetchDoses();
  }, [activePatient?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 border-4 border-[#167C53] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Loading caregiver portal...</p>
        </div>
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <CaregiverLayout
      user={user}
      patients={patients}
      activePatient={activePatient}
      onSelectPatient={setActivePatient}
      onAddPatientClick={() => setIsAddPatientOpen(true)}
    >
      <Routes>
        <Route
          path="/"
          element={
            <DashboardView
              patient={activePatient}
              doses={doses}
              onRefreshDoses={fetchDoses}
              onOpenAddMedication={() => setIsAddMedicationOpen(true)}
              onOpenQrModal={() => setQrModalPatient(activePatient)}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
            />
          }
        />
        <Route
          path="/patients"
          element={
            <PatientsView
              patients={patients}
              activePatient={activePatient}
              onSelectPatient={setActivePatient}
              onRefreshPatients={fetchPatients}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              onOpenQrModal={(p) => setQrModalPatient(p)}
            />
          }
        />
        <Route
          path="/medications"
          element={
            <MedicationsView
              patient={activePatient}
              onOpenAddMedication={() => setIsAddMedicationOpen(true)}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryView patient={activePatient} />}
        />
      </Routes>

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSuccess={(newP) => {
          fetchPatients();
          setActivePatient(newP);
        }}
      />

      <AddMedicationModal
        isOpen={isAddMedicationOpen}
        onClose={() => setIsAddMedicationOpen(false)}
        patientId={activePatient?.id || null}
        onSuccess={() => {
          fetchDoses();
        }}
      />

      <ShareQrModal
        isOpen={!!qrModalPatient}
        onClose={() => setQrModalPatient(null)}
        patient={qrModalPatient}
      />
    </CaregiverLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PwaInstallPrompt />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage initialRegister />} />
        <Route path="/app/*" element={<CaregiverShell />} />
        <Route path="/p/:token" element={<PatientView />} />
      </Routes>
    </BrowserRouter>
  );
}
