import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

type Trend = 'up' | 'down' | 'neutral';

interface StatCardProps {
  icon:        LucideIcon;
  label:       string;
  value:       string | number;
  unit?:       string;
  trend?:      Trend;
  trendLabel?: string;
  iconColor?:  string;
  iconBg?:     string;
  className?:  string;
}

const trendConfig: Record<Trend, { Icon: LucideIcon; color: string }> = {
  up:      { Icon: TrendingUp,   color: 'text-status-taken' },
  down:    { Icon: TrendingDown, color: 'text-status-missed' },
  neutral: { Icon: Minus,        color: 'text-ink-subtle'    },
};

export function StatCard({
  icon:    Icon,
  label,
  value,
  unit,
  trend,
  trendLabel,
  iconColor = 'text-brand',
  iconBg    = 'bg-brand-softer',
  className,
}: StatCardProps) {
  const trendCfg = trend ? trendConfig[trend] : null;

  return (
    <div className={cn('card p-5 flex items-start gap-4', className)}>
      {/* Icon */}
      <div
        className={cn(
          'w-11 h-11 rounded-card flex items-center justify-center flex-shrink-0',
          iconBg,
        )}
        aria-hidden="true"
      >
        <Icon size={22} className={iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-heading font-bold text-ink leading-none">
          {value}
          {unit && (
            <span className="text-sm font-semibold text-ink-muted ml-1">
              {unit}
            </span>
          )}
        </p>

        {trendCfg && trendLabel && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendCfg.color)}>
            <trendCfg.Icon aria-hidden="true" size={12} />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
