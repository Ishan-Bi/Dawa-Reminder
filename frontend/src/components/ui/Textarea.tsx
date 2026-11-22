import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string;
  hint?:     string;
  error?:    string;
  resize?:   'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, resize = 'vertical', className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError   = Boolean(error);

    const resizeClass = {
      none:       'resize-none',
      vertical:   'resize-y',
      horizontal: 'resize-x',
      both:       'resize',
    }[resize];

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={hasError}
          rows={3}
          className={cn(
            'w-full px-3.5 py-2.5 bg-surface border rounded-btn text-sm text-ink placeholder:text-ink-subtle',
            'transition-all duration-[150ms] ease-out',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0 focus:border-brand',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError
              ? 'border-status-missed-border'
              : 'border-surface-border hover:border-ink-subtle',
            resizeClass,
            className,
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
