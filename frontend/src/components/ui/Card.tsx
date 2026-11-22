import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children:   React.ReactNode;
  className?: string;
  as?:        'div' | 'article' | 'section' | 'li';
  hover?:     boolean;
  onClick?:   () => void;
}

export function Card({
  children,
  className,
  as: Tag   = 'div',
  hover      = false,
  onClick,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'bg-surface border border-surface-border rounded-card shadow-card',
        hover && 'transition-all duration-[150ms] hover:shadow-card-md hover:border-ink-faint cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ─── Card sub-components ─────────────────────────────────────────────────── */
interface CardSectionProps {
  children:   React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-5 pt-5 pb-4 border-b border-surface-border', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-5 py-3 bg-surface-raised border-t border-surface-border rounded-b-card', className)}>
      {children}
    </div>
  );
}
