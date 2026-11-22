import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, QrCode, ExternalLink, Languages } from 'lucide-react';
import type { Patient } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface PatientCardProps {
  patient:       Patient;
  isActive?:     boolean;
  onSelect?:     (patient: Patient) => void;
  onShowQr?:     (patient: Patient) => void;
  className?:    string;
}

export function PatientCard({
  patient,
  isActive   = false,
  onSelect,
  onShowQr,
  className,
}: PatientCardProps) {
  const patientUrl = `/p/${patient.access_token}`;

  return (
    <article
      className={cn(
        'bg-surface border rounded-card shadow-card',
        'transition-all duration-[150ms]',
        isActive
          ? 'border-brand ring-1 ring-brand/20 shadow-card-md'
          : 'border-surface-border hover:border-ink-faint hover:shadow-card-md',
        onSelect && 'cursor-pointer',
        className,
      )}
      onClick={() => onSelect?.(patient)}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Avatar */}
        <Avatar name={patient.name} size="md" className="flex-shrink-0 mt-0.5" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-ink truncate">{patient.name}</h3>
            {isActive && (
              <Badge variant="brand">Active</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {patient.age && (
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <User aria-hidden="true" size={11} />
                {patient.age} yrs
              </span>
            )}
            {patient.preferred_language && (
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <Languages aria-hidden="true" size={11} />
                {patient.preferred_language === 'hi' ? 'Hindi' : 'English'}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {onShowQr && (
            <button
              onClick={() => onShowQr(patient)}
              aria-label={`Show QR code for ${patient.name}`}
              title="Show QR code"
              className="p-1.5 rounded-btn text-ink-muted hover:text-brand hover:bg-brand-softer transition-colors duration-[150ms]"
            >
              <QrCode size={15} aria-hidden="true" />
            </button>
          )}
          <a
            href={patientUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open patient view for ${patient.name}`}
            title="Open patient view"
            className="p-1.5 rounded-btn text-ink-muted hover:text-brand hover:bg-brand-softer transition-colors duration-[150ms]"
          >
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
