import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface ErrorStateProps {
  heading?:   string;
  message?:   string;
  onRetry?:   () => void;
  className?: string;
}

export function ErrorState({
  heading   = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      <div className="w-14 h-14 rounded-xl2 bg-status-missed-bg flex items-center justify-center mb-4">
        <AlertCircle aria-hidden="true" size={28} className="text-status-missed" />
      </div>
      <h3 className="text-heading text-base font-bold mb-1">{heading}</h3>
      {message && (
        <p className="text-sm text-ink-muted max-w-xs mb-5">{message}</p>
      )}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={14} aria-hidden="true" />}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
