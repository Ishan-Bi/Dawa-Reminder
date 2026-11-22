import { useState } from 'react';
import { Pill, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface PatientLayoutProps {
  children:   React.ReactNode;
  language?:  'en' | 'hi';
  onToggleLang?: (lang: 'en' | 'hi') => void;
}

const DISCLAIMER_EN = 'Reminder tool only, not medical advice.';
const DISCLAIMER_HI = 'यह एक रिमाइंडर टूल है, चिकित्सकीय सलाह नहीं।';

export function PatientLayout({
  children,
  language     = 'en',
  onToggleLang,
}: PatientLayoutProps) {
  const [lang, setLang] = useState<'en' | 'hi'>(language);

  function toggleLang() {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    onToggleLang?.(next);
  }

  return (
    <div
      lang={lang}
      className={cn(
        'min-h-screen bg-surface-bg flex flex-col',
        lang === 'hi' && 'font-sans',
      )}
    >
      {/* ── Minimal header ─────────────────────────────────────────────── */}
      <header className="bg-surface border-b border-surface-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-card bg-brand flex items-center justify-center flex-shrink-0">
            <Pill aria-hidden="true" size={18} className="text-white" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-ink leading-tight">
              DawaReminder
            </p>
            <p className="text-xs text-ink-muted leading-tight">
              {lang === 'hi' ? 'दवाई रिमाइंडर' : 'Medication Reminder'}
            </p>
          </div>
        </div>

        {/* Language toggle */}
        {onToggleLang && (
          <button
            onClick={toggleLang}
            aria-label={
              lang === 'en'
                ? 'Switch to Hindi'
                : 'Switch to English'
            }
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold',
              'border border-surface-border text-ink-muted',
              'hover:bg-surface-hover hover:text-ink transition-colors duration-[150ms]',
            )}
          >
            <Globe aria-hidden="true" size={13} />
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
        )}
      </header>

      {/* ── Content (huge type optimised for elderly) ───────────────────── */}
      <main
        className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
        aria-label={lang === 'hi' ? 'आपकी दवाइयाँ' : 'Your medicines'}
      >
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="px-4 sm:px-6 py-4 border-t border-surface-border text-center">
        <p className="text-xs text-ink-subtle leading-relaxed">
          {lang === 'hi' ? DISCLAIMER_HI : DISCLAIMER_EN}
        </p>
      </footer>
    </div>
  );
}
