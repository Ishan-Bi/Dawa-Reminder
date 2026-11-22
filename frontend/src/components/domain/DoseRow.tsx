import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Pill } from 'lucide-react';
import type { Dose } from '@/types';
import { StatusChip, type DoseStatus } from '@/components/ui/Badge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface DoseRowProps {
  dose:        Dose;
  onMarkTaken?:   (dose: Dose) => void;
  onMarkSkipped?: (dose: Dose) => void;
  className?:  string;
  compact?:    boolean;
}

function formatTime(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString('en-IN', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return isoTime;
  }
}

export function DoseRow({
  dose,
  onMarkTaken,
  onMarkSkipped,
  className,
  compact = false,
}: DoseRowProps) {
  const status = (dose.status as DoseStatus) ?? 'pending';

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-surface border border-surface-border rounded-card',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
        'transition-colors duration-[150ms] hover:bg-surface-hover',
        className,
      )}
    >
      {/* Time */}
      <div
        className={cn(
          'flex-shrink-0 font-heading font-bold text-ink tabular-nums',
          compact ? 'text-sm w-14' : 'text-base w-16',
        )}
        aria-label={`Scheduled at ${formatTime(dose.scheduled_at)} IST`}
      >
        {formatTime(dose.scheduled_at)}
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-surface-border" aria-hidden="true" />

      {/* Medicine info */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Pill aria-hidden="true" size={14} className="text-ink-subtle flex-shrink-0" />
        <div className="min-w-0">
          <p className={cn('font-semibold text-ink truncate', compact ? 'text-xs' : 'text-sm')}>
            {dose.medication_name ?? 'Medicine'}
          </p>
          {dose.medication_strength && !compact && (
            <p className="text-xs text-ink-muted">{dose.medication_strength}</p>
          )}
        </div>
      </div>

      {/* Status chip */}
      <StatusChip status={status} size={compact ? 'sm' : 'md'} className="flex-shrink-0" />

      {/* Action buttons (only for pending doses) */}
      {status === 'pending' && (onMarkTaken || onMarkSkipped) && !compact && (
        <div className="flex items-center gap-1 flex-shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
          {onMarkTaken && (
            <button
              onClick={() => onMarkTaken(dose)}
              aria-label="Mark as taken"
              className="px-2 py-1 text-[11px] font-semibold rounded-btn bg-status-taken-bg text-status-taken-text border border-status-taken-border hover:brightness-95 transition-all duration-[150ms]"
            >
              Taken ✓
            </button>
          )}
          {onMarkSkipped && (
            <button
              onClick={() => onMarkSkipped(dose)}
              aria-label="Mark as skipped"
              className="px-2 py-1 text-[11px] font-semibold rounded-btn bg-surface-hover text-ink-muted border border-surface-border hover:border-ink-subtle transition-all duration-[150ms]"
            >
              Skip
            </button>
          )}
        </div>
      )}
    </div>
  );
}
