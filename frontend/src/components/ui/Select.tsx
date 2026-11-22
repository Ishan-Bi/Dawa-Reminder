import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  hint?:    string;
  error?:   string;
  options:  { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={hasError}
            className={cn(
              'w-full h-10 pl-3.5 pr-9 bg-surface border rounded-btn text-sm text-ink appearance-none',
              'transition-all duration-[150ms] ease-out',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0 focus:border-brand',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasError
                ? 'border-status-missed-border'
                : 'border-surface-border hover:border-ink-subtle',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden="true"
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-status-missed-text font-medium">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-ink-muted">{hint}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
