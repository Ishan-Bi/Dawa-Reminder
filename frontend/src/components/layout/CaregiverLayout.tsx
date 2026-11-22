import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  HeartHandshake,
  Pill,
} from 'lucide-react';
import type { Caregiver, Patient } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { apiRequest } from '@/lib/api';

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
  { path: '/app/settings', label: 'Settings',  Icon: Settings,         end: false },
];

const DISCLAIMER = 'Reminder tool only, not medical advice.';

export function CaregiverLayout({
  user,
  children,
  activePatient,
  onAddPatient,
}: CaregiverLayoutProps) {
  const navigate = useNavigate();

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

        {/* Active patient chip */}
        {activePatient && (
          <div className="mx-3 mb-3 px-3 py-2.5 bg-brand-softer border border-brand-soft rounded-card">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted mb-0.5">
              Active patient
            </p>
            <p className="text-sm font-bold text-brand-text truncate">{activePatient.name}</p>
            <a
              href={`/p/${activePatient.access_token}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-brand hover:underline"
            >
              <HeartHandshake size={11} aria-hidden="true" />
              Open patient view
            </a>
          </div>
        )}

        {/* Add patient CTA */}
        {!activePatient && onAddPatient && (
          <div className="mx-3 mb-3">
            <button
              onClick={onAddPatient}
              className="w-full text-center py-2 px-3 bg-surface border border-dashed border-brand-soft text-brand rounded-card text-xs font-semibold hover:bg-brand-softer transition-colors duration-[150ms]"
            >
              + Add First Patient
            </button>
          </div>
        )}

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
        <header className="bg-surface border-b border-surface-border px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
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
                href={`/p/${activePatient.access_token}`}
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
