import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  hint?:      string;
  error?:     string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-ink"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-ink-subtle pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              'w-full h-10 bg-surface border rounded-btn text-sm text-ink placeholder:text-ink-subtle',
              'transition-all duration-[150ms] ease-out',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0 focus:border-brand',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover',
              leftIcon  ? 'pl-9'  : 'pl-3.5',
              rightIcon ? 'pr-9'  : 'pr-3.5',
              hasError
                ? 'border-status-missed-border focus:ring-status-missed'
                : 'border-surface-border hover:border-ink-subtle',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 text-ink-subtle">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-status-missed-text font-medium">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
