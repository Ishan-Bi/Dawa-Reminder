import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  CheckCircle2,
  Clock,
  XCircle,
  MinusCircle,
} from 'lucide-react';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export type DoseStatus = 'taken' | 'pending' | 'missed' | 'skipped';

const statusConfig = {
  taken: {
    label: 'Taken',
    Icon: CheckCircle2,
    base: 'bg-status-taken-bg text-status-taken-text border-status-taken-border',
    iconColor: 'text-status-taken',
  },
  pending: {
    label: 'Pending',
    Icon: Clock,
    base: 'bg-status-pending-bg text-status-pending-text border-status-pending-border',
    iconColor: 'text-status-pending',
  },
  missed: {
    label: 'Missed',
    Icon: XCircle,
    base: 'bg-status-missed-bg text-status-missed-text border-status-missed-border',
    iconColor: 'text-status-missed',
  },
  skipped: {
    label: 'Skipped',
    Icon: MinusCircle,
    base: 'bg-status-skipped-bg text-status-skipped-text border-status-skipped-border',
    iconColor: 'text-status-skipped',
  },
};

/* ─── StatusChip ──────────────────────────────────────────────────────────── */
interface StatusChipProps {
  status:    DoseStatus;
  size?:     'sm' | 'md';
  className?: string;
  hideLabel?: boolean;
}

export function StatusChip({
  status,
  size       = 'md',
  className,
  hideLabel  = false,
}: StatusChipProps) {
  const { label, Icon, base, iconColor } = statusConfig[status];

  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-pill font-semibold',
        size === 'sm'
          ? 'px-2    py-0.5 text-[11px]'
          : 'px-2.5 py-1   text-xs',
        base,
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        size={size === 'sm' ? 11 : 13}
        className={iconColor}
      />
      {!hideLabel && <span>{label}</span>}
    </span>
  );
}

/* ─── Generic Badge ───────────────────────────────────────────────────────── */
type BadgeVariant =
  | 'brand'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  // Dose status aliases
  | 'taken'
  | 'pending'
  | 'missed'
  | 'skipped'
  // Legacy food instruction aliases
  | 'foodBefore'
  | 'foodAfter'
  // Legacy primary alias
  | 'primary';

const badgeVariants: Record<BadgeVariant, string> = {
  brand:      'bg-brand-softer text-brand-text border-brand-border',
  neutral:    'bg-surface-raised text-ink-muted  border-surface-border',
  success:    'bg-status-taken-bg   text-status-taken-text   border-status-taken-border',
  warning:    'bg-status-pending-bg text-status-pending-text border-status-pending-border',
  danger:     'bg-status-missed-bg  text-status-missed-text  border-status-missed-border',
  // Dose statuses
  taken:      'bg-status-taken-bg   text-status-taken-text   border-status-taken-border',
  pending:    'bg-status-pending-bg text-status-pending-text border-status-pending-border',
  missed:     'bg-status-missed-bg  text-status-missed-text  border-status-missed-border',
  skipped:    'bg-status-skipped-bg text-status-skipped-text border-status-skipped-border',
  // Legacy food
  foodBefore: 'bg-amber-50  text-amber-700  border-amber-200',
  foodAfter:  'bg-green-50  text-green-700  border-green-200',
  // Legacy primary → brand
  primary:    'bg-brand-softer text-brand-text border-brand-border',
};

interface BadgeProps {
  children:   React.ReactNode;
  variant?:   BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold border rounded-pill',
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
