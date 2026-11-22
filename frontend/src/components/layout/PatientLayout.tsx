import type { ReactNode } from 'react';
import { Pill } from 'lucide-react';

export function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="flex min-h-screen flex-col bg-surface-bg text-ink">
      <header className="border-b border-surface-border bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-card bg-brand text-white">
            <Pill aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="font-heading text-base font-bold leading-tight text-ink">DawaReminder</p>
            <p className="text-sm leading-tight text-ink-muted">Medication reminders</p>
          </div>
        </div>
      </header>
      <main aria-label="Medication schedule" className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-surface-border px-4 py-4 text-center text-sm text-ink-muted sm:px-6">
        Reminder tool only, not medical advice.
      </footer>
    </div>
  );
}
