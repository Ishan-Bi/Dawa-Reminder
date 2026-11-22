import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InboxIcon } from 'lucide-react';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface EmptyStateProps {
  icon?:       React.ElementType;
  heading:     string;
  subtext?:    string;
  action?:     React.ReactNode;
  className?:  string;
}

export function EmptyState({
  icon: Icon  = InboxIcon,
  heading,
  subtext,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      <div className="w-14 h-14 rounded-xl2 bg-brand-softer flex items-center justify-center mb-4">
        <Icon aria-hidden="true" size={28} className="text-brand" />
      </div>
      <h3 className="text-heading text-base font-bold mb-1">{heading}</h3>
      {subtext && (
        <p className="text-sm text-ink-muted max-w-xs mb-5">{subtext}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
