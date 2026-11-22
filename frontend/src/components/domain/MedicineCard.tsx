import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Pill, Utensils, Sun } from 'lucide-react';
import type { Medication } from '@/types';
import { Badge } from '@/components/ui/Badge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface MedicineCardProps {
  medication:  Medication;
  className?:  string;
  onClick?:    () => void;
}

function FoodInstruction({ instruction }: { instruction: string }) {
  if (!instruction) return null;
  const lower = instruction.toLowerCase();
  const isBefore = lower.includes('before');
  const isAfter  = lower.includes('after');

  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded',
      isBefore
        ? 'bg-amber-50  text-amber-700'
        : isAfter
          ? 'bg-green-50 text-green-700'
          : 'bg-surface-raised text-ink-muted',
    )}>
      <Utensils aria-hidden="true" size={10} />
      {instruction}
    </span>
  );
}

export function MedicineCard({ medication, className, onClick }: MedicineCardProps) {
  return (
    <article
      className={cn(
        'bg-surface border border-surface-border rounded-card shadow-card p-4',
        'flex gap-4 items-start',
        onClick && 'cursor-pointer hover:shadow-card-md hover:border-ink-faint transition-all duration-[150ms]',
        className,
      )}
      onClick={onClick}
    >
      {/* Photo or pill icon */}
      <div className="w-12 h-12 rounded-card flex-shrink-0 overflow-hidden bg-brand-softer flex items-center justify-center">
        {medication.photo_url ? (
          <img
            src={medication.photo_url}
            alt={medication.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Pill aria-hidden="true" size={22} className="text-brand" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ink truncate">{medication.name}</h3>
            {medication.strength && (
              <p className="text-xs text-ink-muted mt-0.5">{medication.strength}</p>
            )}
          </div>
          <Badge variant={medication.active !== false ? 'brand' : 'neutral'} className="flex-shrink-0">
            {medication.active !== false ? 'Active' : 'Paused'}
          </Badge>
        </div>

        {/* Schedule hints — show times from each schedule */}
        {medication.schedules && medication.schedules.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {medication.schedules.flatMap((s) =>
              s.times.map((t, i) => (
                <span
                  key={`${s.id}-${i}`}
                  className="inline-flex items-center gap-1 text-[11px] text-ink-muted bg-surface-raised px-1.5 py-0.5 rounded border border-surface-border"
                >
                  <Sun aria-hidden="true" size={10} />
                  {t}
                </span>
              ))
            )}
          </div>
        )}

        {/* Food instruction from first schedule */}
        {medication.schedules?.[0]?.food_instruction && (
          <div className="mt-2">
            <FoodInstruction instruction={medication.schedules[0].food_instruction.replace('_', ' ')} />
          </div>
        )}

        {/* Instructions */}
        {medication.dosage_instructions && (
          <p className="mt-1.5 text-xs text-ink-muted line-clamp-2 leading-relaxed">
            {medication.dosage_instructions}
          </p>
        )}
      </div>
    </article>
  );
}
