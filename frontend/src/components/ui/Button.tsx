import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand text-white border border-brand hover:bg-brand-hover hover:border-brand-hover active:scale-[0.98] shadow-sm',
  secondary:
    'bg-brand-soft text-brand-text border border-brand-soft hover:bg-brand-light hover:border-brand-border active:scale-[0.98]',
  outline:
    'bg-surface text-ink border border-surface-border hover:bg-surface-hover hover:border-ink-subtle active:scale-[0.98]',
  ghost:
    'bg-transparent text-ink-muted border border-transparent hover:bg-surface-hover hover:text-ink active:scale-[0.98]',
  danger:
    'bg-status-missed-bg text-status-missed-text border border-status-missed-border hover:bg-red-100 active:scale-[0.98]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8  px-3   text-xs  gap-1.5 rounded-btn',
  md: 'h-10 px-4   text-sm  gap-2   rounded-btn',
  lg: 'h-12 px-5   text-base gap-2.5 rounded-btn',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  isLoading?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-[150ms] ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" aria-hidden="true" size={16} />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
