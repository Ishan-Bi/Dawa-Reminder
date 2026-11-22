import { useCallback, useEffect, useState } from 'react';
import type { Patient, Dose } from '@/types';
import { apiRequest } from '@/lib/api';
import { StatusChip } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CalendarClock, History, Pill } from 'lucide-react';

interface HistoryViewProps {
  patient: Patient | null;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

export function HistoryView({ patient }: HistoryViewProps) {
  const [history, setHistory] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchHistory = useCallback(async () => {
    if (!patient) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<Dose[]>(`/patients/${patient.id}/history`);
      setHistory(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load dose history.');
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const filtered = statusFilter === 'all' ? history : history.filter((dose) => dose.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{patient?.name ?? 'Family care'}</p>
          <h1 className="mt-1 flex items-center gap-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
            <History aria-hidden="true" className="h-6 w-6 text-brand" /> Dose history
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Review doses recorded by the patient or caregiver.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
          <span>Filter</span>
          <select
            aria-label="Filter doses by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-10 rounded-btn border border-surface-border bg-surface px-3 text-sm text-ink"
          >
            <option value="all">All ({history.length})</option>
            <option value="taken">Taken</option>
            <option value="pending">Pending</option>
            <option value="skipped">Skipped</option>
            <option value="missed">Missed</option>
          </select>
        </label>
      </header>

      {!patient ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card"><EmptyState icon={History} heading="Choose a patient first" subtext="Select or add a patient to view dose history." /></section>
      ) : error ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card"><ErrorState heading="Could not load history" message={error} onRetry={() => void fetchHistory()} /></section>
      ) : loading ? (
        <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
      ) : filtered.length === 0 ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card">
          <EmptyState icon={CalendarClock} heading={statusFilter === 'all' ? 'No doses recorded yet' : `No ${statusFilter} doses`} subtext={statusFilter === 'all' ? 'Dose updates will appear here as the patient or caregiver records them.' : 'Try another status filter.'} />
        </section>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((dose) => {
              const scheduled = formatDateTime(dose.scheduled_at);
              const acted = dose.acted_at ? formatDateTime(dose.acted_at) : null;
              return (
                <article key={dose.id} className="rounded-card border border-surface-border bg-surface p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-brand-softer text-brand"><Pill aria-hidden="true" size={18} /></span>
                      <div className="min-w-0"><h2 className="truncate font-bold text-ink">{dose.medication_name ?? 'Medication'}</h2><p className="text-sm text-ink-muted">{dose.medication_strength ?? ''}</p></div>
                    </div>
                    <StatusChip status={dose.status} size="sm" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-surface-border pt-3 text-xs">
                    <div><p className="text-ink-subtle">Scheduled</p><p className="mt-0.5 font-semibold text-ink">{scheduled.date} · {scheduled.time}</p></div>
                    <div><p className="text-ink-subtle">Recorded</p><p className="mt-0.5 font-semibold text-ink">{acted ? `${acted.date} · ${acted.time}` : '—'}</p></div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-card border border-surface-border bg-surface shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-surface-raised text-xs font-bold uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th scope="col" className="px-5 py-4">Scheduled</th>
                    <th scope="col" className="px-5 py-4">Medication</th>
                    <th scope="col" className="px-5 py-4">Status</th>
                    <th scope="col" className="px-5 py-4">Recorded</th>
                    <th scope="col" className="px-5 py-4">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filtered.map((dose) => {
                    const scheduled = formatDateTime(dose.scheduled_at);
                    const acted = dose.acted_at ? formatDateTime(dose.acted_at) : null;
                    return (
                      <tr key={dose.id} className="hover:bg-surface-hover">
                        <td className="whitespace-nowrap px-5 py-4"><span className="font-semibold text-ink">{scheduled.date}</span><span className="ml-2 text-ink-muted">{scheduled.time}</span></td>
                        <td className="px-5 py-4"><p className="font-semibold text-ink">{dose.medication_name ?? 'Medication'}</p>{dose.medication_strength && <p className="text-xs text-ink-muted">{dose.medication_strength}</p>}</td>
                        <td className="px-5 py-4"><StatusChip status={dose.status} size="sm" /></td>
                        <td className="whitespace-nowrap px-5 py-4 text-ink-muted">{acted ? `${acted.date} · ${acted.time}` : '—'}</td>
                        <td className="px-5 py-4 text-ink-muted">{dose.acted_by ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
