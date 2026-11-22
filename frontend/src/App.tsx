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
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between px-5 sm:px-8 max-w-6xl mx-auto">
      <header className="py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="DawaReminder home" className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#167C53] flex items-center justify-center text-white font-bold text-xl shadow-sm">
              द
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#202824]">DawaReminder</h1>
              <p className="text-xs text-[#5C6863]">Family care, made simpler</p>
            </div>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex px-4 py-2.5 text-sm font-semibold text-[#315044] hover:text-[#167C53]">Sign in</Link>
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center rounded-xl bg-[#167C53] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D4E34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167C53]"
            >
              Get started <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="my-8 sm:my-12 space-y-8 sm:space-y-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-[#EAF6EF] via-white to-[#F5F0E5] px-6 py-10 sm:px-12 sm:py-14">
          <div aria-hidden="true" className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-[#D7EBDD]/70 blur-2xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#B8D9C5] bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#167C53]">
                <HeartHandshake aria-hidden="true" className="h-4 w-4" /> A little help, every day
              </p>
              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#173B2B] sm:text-5xl lg:text-6xl">
                Care feels easier when everyone knows the routine.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#53665B] sm:text-lg">
                Set up medicine reminders for someone you love. They get a calm, simple view; you can keep track of the routine.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#167C53] px-6 py-3 font-bold text-white shadow-md transition hover:bg-[#0D4E34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167C53]">
                  Create caregiver account <span aria-hidden="true">→</span>
                </Link>
                <Link to="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#C8D8CE] bg-white px-6 py-3 font-bold text-[#315044] transition hover:bg-[#F5FAF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167C53]">
                  I already have an account
                </Link>
              </div>
              <p className="mt-4 text-sm text-[#66756C]">Free to get started · Private caregiver sign-in</p>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-5 top-10 h-20 w-20 rounded-full bg-[#F4DCA5]/60 blur-xl" />
              <div className="relative rounded-[1.75rem] border border-white bg-white/90 p-5 shadow-[0_24px_70px_-35px_rgba(31,77,53,0.45)] backdrop-blur sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#708078]">Made for families</p>
                    <h3 className="mt-1 text-xl font-extrabold text-[#173B2B]">One shared routine</h3>
                  </div>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EAF6EF] text-[#167C53]"><HeartHandshake aria-hidden="true" className="h-6 w-6" /></div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    ['01', 'Family adds the medicine plan', 'Keep the instructions together.'],
                    ['02', 'Share a simple patient link', 'No password needed for the patient view.'],
                    ['03', 'See dose updates in one place', 'Stay in the loop from your account.'],
                  ].map(([number, title, description]) => (
                    <div key={number} className="flex gap-3 rounded-2xl bg-[#F7FAF8] p-3.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-extrabold text-[#167C53] shadow-sm">{number}</span>
                      <div><p className="font-bold text-[#253B30]">{title}</p><p className="mt-0.5 text-sm leading-5 text-[#6A786F]">{description}</p></div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FFF8E8] px-3.5 py-3 text-sm font-semibold text-[#785B1E]">
                  <Shield aria-hidden="true" className="h-4 w-4 shrink-0" /> A reminder tool for family support
                </div>
              </div>
            </div>
          </div>
        </section>

        <details className="group rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#40534A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167C53]">
            <span className="flex items-center gap-2"><Activity aria-hidden="true" className="h-5 w-5 text-[#167C53]" /> Technical service status</span>
            <span aria-hidden="true" className="text-sm text-gray-500 group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-4 border-t border-gray-100 pt-4">
            {loading && <p className="text-sm text-gray-500">Checking backend and database connectivity…</p>}
            {error && <p role="status" className="flex items-center gap-2 text-sm text-red-700"><AlertCircle aria-hidden="true" className="h-4 w-4" /> Backend unavailable: {error}</p>}
            {health && <p role="status" className="flex items-center gap-2 text-sm text-[#0D4E34]"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /> {health.service} is {health.status}; database connected ({health.database}).</p>}
          </div>
        </details>

        <section aria-labelledby="features-heading" className="space-y-5">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#167C53]">For the whole family</p>
            <h2 id="features-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-[#173B2B] sm:text-3xl">Support that feels simple on both sides.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-[#167C53]"><Shield aria-hidden="true" className="h-5 w-5" /></div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">A clear caregiver workspace</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">Keep patient details, medicine instructions, schedules, and dose history together.</p>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-800"><HeartHandshake aria-hidden="true" className="h-5 w-5" /></div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">A calmer patient view</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">Large, easy-to-read dose cards and simple actions, opened from a family-shared link.</p>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-800"><Activity aria-hidden="true" className="h-5 w-5" /></div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Stay in the loop</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">Review recorded dose updates and use Hindi or English in the patient experience.</p>
            </article>
          </div>
          <Link to="/register" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 py-2 font-bold text-[#167C53] hover:text-[#0D4E34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167C53]">
            Set up your family account <span aria-hidden="true">→</span>
          </Link>
        </section>
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
