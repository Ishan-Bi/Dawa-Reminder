import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
  width?:     string | number;
  height?:    string | number;
  rounded?:   'sm' | 'md' | 'full' | 'card';
}

export function Skeleton({
  className,
  width,
  height,
  rounded = 'md',
}: SkeletonProps) {
  const roundedClass = {
    sm:   'rounded',
    md:   'rounded-btn',
    full: 'rounded-pill',
    card: 'rounded-card',
  }[rounded];

  return (
    <div
      aria-hidden="true"
      className={cn('skeleton', roundedClass, className)}
      style={{ width, height }}
    />
  );
}

/* ─── Convenience skeletons ──────────────────────────────────────────────── */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?:     number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          className={i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-5 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} className="w-1/2" />
          <Skeleton height={12} className="w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
