import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { Caregiver, Patient, Dose, Medication } from '@/types';
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
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Activity, Shield, HeartHandshake, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: string;
}

function HomePage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientAccess, setPatientAccess] = useState('');
  const [patientAccessError, setPatientAccessError] = useState('');

  const openPatientSection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = patientAccess.trim();
    let token = value.replace(/^\/?p\//, '').replace(/\/+$/, '');
    if (/^https?:\/\//i.test(value)) {
      try {
        token = new URL(value).pathname.match(/\/p\/([^/]+)\/?$/)?.[1] ?? '';
      } catch {
        token = '';
      }
    }
    if (!token || token.includes('/')) {
      setPatientAccessError('Paste a patient access link or its access token.');
      return;
    }
    setPatientAccessError('');
    navigate(`/p/${encodeURIComponent(token)}`);
  };

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
              DR
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#202824]">DawaReminder</h1>
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
            </div>

            <div className="relative mx-auto w-full max-w-lg space-y-4">
              <article id="caregiver-section" className="rounded-[1.75rem] border border-white bg-white/95 p-5 shadow-[0_24px_70px_-35px_rgba(31,77,53,0.35)] backdrop-blur sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EAF6EF] text-[#167C53]"><Shield aria-hidden="true" className="h-5 w-5" /></span>
                  <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#708078]">Caregiver section</p><h3 className="mt-1 text-xl font-extrabold text-[#173B2B]">Manage the family routine</h3><p className="mt-1 text-sm leading-5 text-[#6A786F]">Set up patients, medicines, dose times, and review updates.</p></div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link to="/register" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#167C53] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0D4E34]">Create account <span aria-hidden="true">→</span></Link>
                  <Link to="/login" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#C8D8CE] bg-white px-4 py-2.5 text-sm font-bold text-[#315044] transition hover:bg-[#F5FAF6]">Caregiver sign in</Link>
                </div>
              </article>

              <article id="patient-section" className="rounded-[1.75rem] border border-[#CDE8DF] bg-[#F1FAF7] p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#4BAE9A]"><HeartHandshake aria-hidden="true" className="h-5 w-5" /></span>
                  <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4B9B88]">Patient section</p><h3 className="mt-1 text-xl font-extrabold text-[#24443A]">Open your medicine schedule</h3><p className="mt-1 text-sm leading-5 text-[#688078]">Use the link or access token shared by your caregiver. No account is needed.</p></div>
                </div>
                <form className="mt-4 space-y-2" onSubmit={openPatientSection}>
                  <label htmlFor="patient-access" className="text-xs font-bold text-[#48675C]">Patient link or access token</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input id="patient-access" value={patientAccess} onChange={(event) => { setPatientAccess(event.target.value); setPatientAccessError(''); }} placeholder="Paste your shared patient link" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#CFE3DC] bg-white px-3 text-sm text-[#263A32] outline-none placeholder:text-[#9AAAA3] focus:border-[#4BAE9A] focus:ring-2 focus:ring-[#4BAE9A]/20" />
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4BAE9A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#368F7E]">Open patient view <span aria-hidden="true">→</span></button>
                  </div>
                  {patientAccessError && <p role="alert" className="text-sm font-semibold text-red-700">{patientAccessError}</p>}
                </form>
              </article>
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
              <p className="mt-2 text-sm leading-6 text-gray-600">Review recorded dose updates in one place.</p>
            </article>
          </div>
          <Link to="/register" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 py-2 font-bold text-[#167C53] hover:text-[#0D4E34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167C53]">
            Set up your family account <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">This is a reminder tool, not medical advice.</p>
      </footer>
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-bg px-5 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-surface-border bg-white p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-softer text-2xl font-extrabold text-brand-text">404</span>
        <h1 className="mt-5 text-3xl font-bold text-ink">This page isn’t here</h1>
        <p className="mt-2 text-ink-muted">The link may be out of date. Return to DawaReminder and choose a page from the menu.</p>
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-hover"><ArrowLeft size={17} /> Go to home</Link>
      </section>
    </main>
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
    <main className="min-h-screen bg-surface-bg lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-brand px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div aria-hidden="true" className="absolute -right-32 -top-24 h-96 w-96 rounded-full border-[56px] border-white/10" />
        <Link to="/" className="relative inline-flex w-fit items-center gap-3 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 font-bold">DR</span>
          <span className="font-heading text-lg font-bold">DawaReminder</span>
        </Link>
        <div className="relative max-w-xl py-14">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/75">Caregiver workspace</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight text-white xl:text-5xl">Make the daily medicine routine easier to follow.</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/80">Keep patient profiles, medication schedules, and dose updates together in one place.</p>
        </div>
        <p className="relative text-sm text-white/70">A reminder tool for family support.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="text-sm font-semibold text-brand hover:underline">← Back to home</Link>
          <div className="mt-6 rounded-3xl border border-surface-border bg-surface p-6 shadow-card sm:p-9">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-bold text-white">DR</span>
              <span className="font-heading font-bold text-ink">DawaReminder</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{registering ? 'Get started' : 'Welcome back'}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-ink">
              {registering ? 'Create your account' : 'Sign in'}
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              {registering ? 'Create a caregiver account to set up a family medication routine.' : 'Sign in to manage your family’s medication routine.'}
            </p>

            <form className="mt-7 space-y-4" onSubmit={submit}>
              {registering && (
                <label className="block text-sm font-semibold text-ink">
                  Full name
                  <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-btn border border-surface-border bg-surface px-3 py-2 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                </label>
              )}
              <label className="block text-sm font-semibold text-ink">
                Email address
                <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-btn border border-surface-border bg-surface px-3 py-2 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Password
                <input required type="password" minLength={8} autoComplete={registering ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-btn border border-surface-border bg-surface px-3 py-2 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                {registering && <span className="mt-1 block text-xs font-normal text-ink-muted">At least 8 characters.</span>}
              </label>
              {error && <p role="alert" className="rounded-btn border border-status-missed-border bg-status-missed-bg p-3 text-sm text-status-missed-text">{error}</p>}
              <Button type="submit" size="lg" fullWidth isLoading={submitting}>
                {submitting ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
              {registering ? 'Already have an account?' : 'New to DawaReminder?'}{' '}
              <button type="button" onClick={() => { setRegistering(!registering); setError(''); }} className="font-semibold text-brand hover:underline">
                {registering ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function CaregiverShell() {
  const [user, setUser] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsReady, setPatientsReady] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationsRefreshKey, setMedicationsRefreshKey] = useState(0);

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [qrModalPatient, setQrModalPatient] = useState<Patient | null>(null);

  const openAddMedication = () => {
    setEditingMedication(null);
    setIsAddMedicationOpen(true);
  };
  const openEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setIsAddMedicationOpen(true);
  };

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
      setPatientsError(null);
      setActivePatient((current) => {
        if (data.length === 0) return null;
        return current && data.some((patient) => patient.id === current.id) ? current : data[0];
      });
    } catch (error) {
      setPatientsError(error instanceof Error ? error.message : 'Could not load patient profiles.');
    } finally {
      setPatientsReady(true);
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

  if (!patientsReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface-bg p-6">
        <div role="status" className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="mt-4 font-semibold text-ink">Loading your care workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <CaregiverLayout
      user={user}
      patients={patients}
      activePatient={activePatient}
      onSelectPatient={setActivePatient}
      onAddPatientClick={() => setIsAddPatientOpen(true)}
    >
      {patientsError ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card">
          <ErrorState heading="Could not load patients" message={patientsError} onRetry={() => void fetchPatients()} />
        </section>
      ) : <Routes>
        <Route
          path="/"
          element={
            <DashboardView
              patient={activePatient}
              doses={doses}
              onRefreshDoses={fetchDoses}
              onOpenAddMedication={openAddMedication}
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
              onOpenAddMedication={openAddMedication}
              onEditMedication={openEditMedication}
              refreshKey={medicationsRefreshKey}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryView patient={activePatient} />}
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>}

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSuccess={async (newP) => {
          await fetchPatients();
          setActivePatient(newP);
        }}
      />

      <AddMedicationModal
        isOpen={isAddMedicationOpen}
        onClose={() => { setIsAddMedicationOpen(false); setEditingMedication(null); }}
        patientId={activePatient?.id || null}
        medication={editingMedication}
        onSuccess={() => {
          setMedicationsRefreshKey((value) => value + 1);
          void fetchDoses();
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
