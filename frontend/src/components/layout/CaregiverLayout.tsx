import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  History,
  LogOut,
  HeartHandshake,
  Pill,
} from 'lucide-react';
import type { Caregiver, Patient } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { apiRequest } from '@/lib/api';
import { patientAccessUrl } from '@/lib/patientAccess';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface CaregiverLayoutProps {
  user:             Caregiver;
  children:         React.ReactNode;
  patients?:        Patient[];
  activePatient?:   Patient | null;
  onAddPatient?:    () => void;
  /** Passed through from App.tsx — forwarded to children via context if needed */
  onSelectPatient?: (patient: Patient | null) => void;
  /** Alias used by some feature views */
  onAddPatientClick?: () => void;
}

const navItems = [
  { path: '/app',          label: 'Dashboard', Icon: LayoutDashboard, end: true  },
  { path: '/app/patients', label: 'Patients',  Icon: Users,            end: false },
  { path: '/app/medications', label: 'Medications', Icon: ClipboardList, end: false },
  { path: '/app/history', label: 'Dose history', Icon: History, end: false },
];

const DISCLAIMER = 'Reminder tool only, not medical advice.';

export function CaregiverLayout({
  user,
  children,
  patients = [],
  activePatient,
  onSelectPatient,
  onAddPatient,
  onAddPatientClick,
}: CaregiverLayoutProps) {
  const navigate = useNavigate();
  const addPatient = onAddPatientClick ?? onAddPatient;

  async function handleLogout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-[260px] min-h-screen bg-surface border-r border-surface-border shadow-sidebar flex-shrink-0 sticky top-0 h-screen overflow-y-auto">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-brand flex items-center justify-center flex-shrink-0">
              <Pill aria-hidden="true" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-ink leading-tight">DawaReminder</p>
              <p className="text-[10px] text-ink-muted leading-tight">Family Care</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ path, label, Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-semibold',
                  'transition-all duration-[150ms]',
                  isActive
                    ? 'bg-brand-softer text-brand border border-brand-soft'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-hover',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    aria-hidden="true"
                    size={17}
                    className={isActive ? 'text-brand' : 'text-ink-subtle'}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Patient switcher */}
        <div className="mx-3 mb-3 rounded-card border border-surface-border bg-surface-raised p-3">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="sidebar-patient" className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Current patient</label>
            {addPatient && <button type="button" onClick={addPatient} className="text-xs font-semibold text-brand hover:underline">Add</button>}
          </div>
          {patients.length > 0 && onSelectPatient ? (
            <select
              id="sidebar-patient"
              value={activePatient?.id ?? ''}
              onChange={(event) => {
                const selected = patients.find((item) => item.id === Number(event.target.value));
                if (selected) onSelectPatient(selected);
              }}
              className="w-full rounded-btn border border-surface-border bg-surface px-3 py-2 text-sm font-semibold text-ink focus-visible:ring-2 focus-visible:ring-brand"
            >
              {patients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          ) : activePatient ? (
            <p className="truncate text-sm font-semibold text-ink">{activePatient.name}</p>
          ) : (
            <p className="text-xs text-ink-muted">No patient added</p>
          )}
          {!activePatient && addPatient && (
            <button type="button" onClick={addPatient} className="mt-2 w-full rounded-btn border border-dashed border-brand-soft bg-surface px-3 py-2 text-xs font-semibold text-brand hover:bg-brand-softer">Add your first patient</button>
          )}
        </div>

        {/* User card + logout */}
        <div className="p-4 border-t border-surface-border flex items-center gap-2.5">
          <Avatar name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink truncate">{user.name}</p>
            <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-btn text-ink-subtle hover:text-red-600 hover:bg-red-50 transition-colors duration-[150ms]"
          >
            <LogOut size={15} aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-16 md:pb-0">

        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-surface-border bg-surface px-4 py-3.5 md:px-6">
          <div className="flex items-center justify-between gap-3">
          {/* Mobile: logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-btn bg-brand flex items-center justify-center">
              <Pill size={14} aria-hidden="true" className="text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-ink">DawaReminder</span>
          </div>

          {/* Desktop: breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-ink-muted">
            <span className="text-ink font-semibold">Family Care</span>
            {activePatient && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-brand font-semibold">{activePatient.name}</span>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {activePatient && (
              <a
                href={patientAccessUrl(activePatient.access_token)}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-softer text-brand hover:bg-brand-soft rounded-pill text-xs font-semibold border border-brand-soft transition-colors duration-[150ms]"
              >
                <HeartHandshake size={13} aria-hidden="true" />
                Patient View
              </a>
            )}
            <Avatar name={user.name} size="sm" className="ring-2 ring-surface-border" />
          </div>
          </div>
          {patients.length > 0 && onSelectPatient && (
            <div className="mt-3 flex items-center gap-2 md:hidden">
              <label htmlFor="mobile-patient" className="sr-only">Choose patient</label>
              <select
                id="mobile-patient"
                value={activePatient?.id ?? ''}
                onChange={(event) => {
                  const selected = patients.find((item) => item.id === Number(event.target.value));
                  if (selected) onSelectPatient(selected);
                }}
                className="min-h-11 min-w-0 flex-1 rounded-btn border border-surface-border bg-surface-raised px-3 text-sm font-semibold text-ink"
              >
                {patients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              {addPatient && <button type="button" onClick={addPatient} className="min-h-11 rounded-btn border border-brand-soft px-3 text-sm font-semibold text-brand">Add patient</button>}
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 md:px-8 py-3 border-t border-surface-border text-center">
          <p className="text-[11px] text-ink-subtle">{DISCLAIMER}</p>
        </footer>
      </div>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-surface-border z-30"
      >
        <div className="flex justify-around items-center px-2 py-1">
          {navItems.map(({ path, label, Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-btn',
                  'text-[10px] font-semibold transition-colors duration-[150ms]',
                  isActive
                    ? 'text-brand'
                    : 'text-ink-subtle hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    aria-hidden="true"
                    size={20}
                    className={isActive ? 'text-brand' : ''}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
