import { useCallback, useEffect, useState } from 'react';
import type { Patient, Medication } from '@/types';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { MedicineCard } from '@/components/domain/MedicineCard';
import { Pill, Plus, Play, Pause, Pencil } from 'lucide-react';

interface MedicationsViewProps {
  patient: Patient | null;
  onOpenAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  refreshKey: number;
}

export function MedicationsView({ patient, onOpenAddMedication, onEditMedication, refreshKey }: MedicationsViewProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchMedications = useCallback(async () => {
    if (!patient) {
      setMedications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<Medication[]>(`/patients/${patient.id}/medications`);
      setMedications(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this patient’s medications.');
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    void fetchMedications();
  }, [fetchMedications, refreshKey]);

  const handleToggleActive = async (medication: Medication) => {
    setTogglingId(medication.id);
    setError(null);
    try {
      await apiRequest(`/medications/${medication.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !medication.active }),
      });
      await fetchMedications();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this medication.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{patient?.name ?? 'Family care'}</p>
          <h1 className="mt-1 flex items-center gap-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
            <Pill aria-hidden="true" className="h-6 w-6 text-brand" /> Medications
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Medicine details and daily schedules.</p>
        </div>
        <Button onClick={onOpenAddMedication} disabled={!patient}>
          <Plus aria-hidden="true" size={16} /> Add medication
        </Button>
      </header>

      {!patient ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card">
          <EmptyState icon={Pill} heading="Choose a patient first" subtext="Select or add a patient to manage medications." />
        </section>
      ) : error ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card">
          <ErrorState heading="Could not load medications" message={error} onRetry={() => void fetchMedications()} />
        </section>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => <SkeletonCard key={item} />)}
        </div>
      ) : medications.length === 0 ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card">
          <EmptyState
            icon={Pill}
            heading="No medications yet"
            subtext="Add a medication and set its dose times to build today’s schedule."
            action={<Button onClick={onOpenAddMedication}><Plus aria-hidden="true" size={16} /> Add medication</Button>}
          />
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {medications.map((medication) => (
            <div key={medication.id} className={`overflow-hidden rounded-card border border-surface-border bg-surface shadow-card ${medication.active ? '' : 'opacity-70'}`}>
              <div className="p-4"><MedicineCard medication={medication} className="border-0 p-0 shadow-none" /></div>
              {medication.prescription_notes && (
                <p className="mx-4 mb-3 rounded-btn bg-surface-raised px-3 py-2 text-xs text-ink-muted">{medication.prescription_notes}</p>
              )}
              <div className="flex items-center justify-between border-t border-surface-border bg-surface-raised px-4 py-3">
                <span className="text-xs text-ink-subtle">Added {new Date(medication.created_at).toLocaleDateString('en-IN')}</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => onEditMedication(medication)}>
                    <Pencil aria-hidden="true" size={14} /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isLoading={togglingId === medication.id}
                    onClick={() => void handleToggleActive(medication)}
                    className={medication.active ? 'text-amber-700' : 'text-brand'}
                  >
                    {medication.active ? <><Pause aria-hidden="true" size={14} /> Pause</> : <><Play aria-hidden="true" size={14} /> Resume</>}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
