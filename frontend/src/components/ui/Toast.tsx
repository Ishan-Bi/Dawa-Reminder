import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id:       string;
  message:  string;
  variant?: ToastVariant;
  duration?: number;
}

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; classes: string }
> = {
  success: { icon: CheckCircle2, classes: 'bg-status-taken-bg   text-status-taken-text   border-status-taken-border' },
  error:   { icon: AlertCircle,  classes: 'bg-status-missed-bg  text-status-missed-text  border-status-missed-border' },
  warning: { icon: AlertTriangle,classes: 'bg-status-pending-bg text-status-pending-text border-status-pending-border' },
  info:    { icon: Info,         classes: 'bg-brand-softer      text-brand-text          border-brand-border' },
};

/* ─── Single Toast ────────────────────────────────────────────────────────── */
function ToastItem({
  toast,
  onRemove,
}: {
  toast:    ToastData;
  onRemove: (id: string) => void;
}) {
  const { icon: Icon, classes } = variantConfig[toast.variant ?? 'info'];

  useEffect(() => {
    const timer = setTimeout(
      () => onRemove(toast.id),
      toast.duration ?? 4000,
    );
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 px-4 py-3 border rounded-card shadow-card-md',
        'w-80 max-w-full animate-slideUp',
        classes,
      )}
    >
      <Icon aria-hidden="true" size={16} className="mt-0.5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ─── Toast Container (portal) ───────────────────────────────────────────── */
interface ToastContainerProps {
  toasts:   ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body,
  );
}

/* ─── useToast hook ───────────────────────────────────────────────────────── */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const add = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, add, remove };
}
