import type { ReactNode } from 'react';
import { Pill } from 'lucide-react';

export function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en" className="min-h-screen bg-[#F0F8F5] text-[#253B35]">
      <header className="px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#54B5A4] text-white">
            <Pill aria-hidden="true" size={19} />
          </span>
          <div>
            <p className="font-heading text-sm font-bold leading-tight text-[#263C35]">DawaReminder</p>
            <p className="text-xs leading-tight text-[#7B918A]">Your daily medicine plan</p>
          </div>
        </div>
      </header>
      <main aria-label="Medication schedule" className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
        {children}
      </main>
    </div>
  );
}
