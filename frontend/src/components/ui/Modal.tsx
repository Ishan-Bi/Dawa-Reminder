import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  size?:     'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Legacy prop — maps to size; pass a Tailwind max-w-* class */
  maxWidth?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size      = 'md',
  className,
  maxWidth,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Focus trap — focus the panel on open */
  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* Prevent body scroll */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="modal-backdrop absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'modal-panel relative z-10 w-full bg-surface rounded-modal shadow-modal',
          'flex flex-col max-h-[90vh] overflow-hidden',
          'outline-none',
          maxWidth ?? sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-surface-border flex-shrink-0">
            <h2
              id="modal-title"
              className="text-lg font-heading font-bold text-ink"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-btn text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-[150ms]"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
