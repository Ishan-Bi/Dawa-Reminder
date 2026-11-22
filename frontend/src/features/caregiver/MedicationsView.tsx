import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Medication, Patient } from '@/types';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CalendarDays, Clock3, FileText, MoreHorizontal, Pause, Pencil, Pill, Play, Plus, Search, Sunrise, Sunset } from 'lucide-react';

interface MedicationsViewProps {
  patient: Patient | null;
  onOpenAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  refreshKey: number;
}

type Filter = 'all' | 'active' | 'paused' | 'prescription';
type TimeGroup = 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime';
const timeGroups: TimeGroup[] = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];
const groupForTime = (time: string): TimeGroup => {
  const hour = Number(time.slice(0, 2));
  if (hour < 11) return 'Morning';
  if (hour < 16) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Bedtime';
};
const formatTime = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export function MedicationsView({ patient, onOpenAddMedication, onEditMedication, refreshKey }: MedicationsViewProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const fetchMedications = useCallback(async () => {
    if (!patient) {
      setMedications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setMedications(await apiRequest<Medication[]>(`/patients/${patient.id}/medications`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this patient’s medications.');
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => { void fetchMedications(); }, [fetchMedications, refreshKey]);

  const handleToggleActive = async (medication: Medication) => {
    setTogglingId(medication.id);
    setError(null);
    try {
      await apiRequest(`/medications/${medication.id}`, { method: 'PATCH', body: JSON.stringify({ active: !medication.active }) });
      await fetchMedications();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this medication.');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = useMemo(() => medications.filter((medication) => {
    const matchesFilter = filter === 'all'
      || (filter === 'active' && medication.active)
      || (filter === 'paused' && !medication.active)
      || (filter === 'prescription' && Boolean(medication.prescription_notes));
    const matchesSearch = `${medication.name} ${medication.strength ?? ''} ${medication.purpose ?? ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [medications, filter, search]);
  const activeCount = medications.filter((medication) => medication.active).length;
  const pausedCount = medications.length - activeCount;
  const prescriptionCount = medications.filter((medication) => medication.prescription_notes).length;
  const groups = useMemo(() => timeGroups.map((label) => ({
    label,
    meds: filtered.flatMap((medication) => (medication.active ? medication.schedules ?? [] : [])
      .filter((schedule) => schedule.active)
      .flatMap((schedule) => schedule.times.filter((time) => groupForTime(time) === label).map((time) => ({ medication, time, food: schedule.food_instruction })))),
  })), [filtered]);
  const unscheduled = filtered.filter((medication) => medication.active && !(medication.schedules ?? []).some((schedule) => schedule.active && schedule.times.length));

  const counts = [
    { key: 'all' as const, label: 'Medications', count: medications.length, accent: '#E7796C' },
    { key: 'prescription' as const, label: 'Prescription notes', count: prescriptionCount, accent: '#8D72BD' },
    { key: 'active' as const, label: 'Active plans', count: activeCount, accent: '#55B59E' },
    { key: 'paused' as const, label: 'Paused plans', count: pausedCount, accent: '#9DA9A2' },
  ];

  return (
    <div className="space-y-6 pb-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">{patient?.name ?? 'Family care'}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Medication tracker</h1><p className="mt-2 text-sm text-ink-muted">Medicine details, prescription notes, and daily schedules.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><span className="sr-only">Search medicines</span><Search aria-hidden="true" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines" className="min-h-11 w-full rounded-xl border border-surface-border bg-white pl-10 pr-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-56" /></label><Button onClick={onOpenAddMedication} disabled={!patient}><Plus size={16} /> Add medication</Button></div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">{counts.map((item) => <button key={item.key} type="button" aria-pressed={filter === item.key} onClick={() => setFilter(item.key)} className={`flex items-center justify-between rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-card-md ${filter === item.key ? 'border-brand/50 ring-2 ring-brand/10' : 'border-surface-border'}`}><span className="flex items-center gap-3"><span className="h-9 w-1 rounded-full" style={{ backgroundColor: item.accent }} /><span><span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">{item.label}</span><span className="mt-1 block text-2xl font-bold text-ink">{item.count}</span></span></span><span className="grid h-9 w-9 place-items-center rounded-full bg-surface-raised text-ink-subtle"><MoreHorizontal size={18} /></span></button>)}</div>

      {error && <div role="alert" className="rounded-2xl border border-status-missed-border bg-status-missed-bg p-1"><ErrorState heading="Medication update failed" message={error} onRetry={() => void fetchMedications()} /></div>}

      {!patient ? <section className="rounded-2xl border border-surface-border bg-white shadow-card"><EmptyState icon={Pill} heading="Choose a patient first" subtext="Select or add a patient to manage medications." /></section>
        : loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div>
        : medications.length === 0 ? <section className="rounded-2xl border border-surface-border bg-white shadow-card"><EmptyState icon={Pill} heading="No medications yet" subtext="Add a medication and enter its prescribed dose times to create a clear routine." action={<Button onClick={onOpenAddMedication}><Plus size={16} /> Add medication</Button>} /></section>
        : filtered.length === 0 ? <section className="rounded-2xl border border-surface-border bg-white shadow-card"><EmptyState icon={Search} heading="No matching medications" subtext="Try another search or choose a different medication filter." /></section>
        : <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-5">
            <section className="rounded-[1.75rem] border border-surface-border bg-white p-4 shadow-card sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">Daily schedule</h2><p className="text-sm text-ink-muted">Dose times entered for {patient.name}</p></div><span className="inline-flex items-center gap-2 rounded-full bg-brand-softer px-3 py-1.5 text-xs font-semibold text-brand-text"><CalendarDays size={14} /> Times are local to Asia/Kolkata</span></div>
              {groups.some((group) => group.meds.length > 0) || unscheduled.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{groups.filter((group) => group.meds.length > 0).map((group, index) => {
                const Icon = index === 0 ? Sunrise : index === 1 ? Clock3 : index === 2 ? Sunset : Clock3;
                return <section key={group.label} className="rounded-2xl bg-[#F8FBF9] p-3.5"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#7D8C83]"><Icon size={15} className="text-brand" />{group.label}</div><div className="space-y-2">{group.meds.map(({ medication, time, food }, idx) => <article key={`${medication.id}-${time}-${idx}`} className="flex items-center gap-2.5 rounded-xl border border-[#E7EFEA] bg-white p-3 shadow-sm"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EAF6F1] text-brand"><Pill size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{medication.name}{medication.strength ? ` ${medication.strength}` : ''}</p><p className="text-xs text-ink-muted">{medication.dosage_instructions || 'Dose'} · {food === 'before_food' ? 'Before food' : food === 'after_food' ? 'After food' : 'Any time'}</p></div><span className="shrink-0 text-right text-xs font-semibold tabular-nums text-ink-muted">{formatTime(time)}</span><button type="button" aria-label={`Edit ${medication.name}`} onClick={() => onEditMedication(medication)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-brand-softer hover:text-brand"><Pencil size={14} /></button></article>)}</div></section>;
              })}{unscheduled.length > 0 && <section className="rounded-2xl bg-[#F8FBF9] p-3.5"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#7D8C83]"><Clock3 size={15} className="text-brand" />Needs a schedule</div><div className="space-y-2">{unscheduled.map((medication) => <article key={medication.id} className="flex items-center gap-2.5 rounded-xl border border-[#E7EFEA] bg-white p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EAF6F1] text-brand"><Pill size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{medication.name}</p><p className="text-xs text-ink-muted">No active dose times</p></div><button type="button" onClick={() => onEditMedication(medication)} className="rounded-lg px-2 py-1 text-xs font-bold text-brand-text hover:bg-brand-softer">Set times</button></article>)}</div></section>}</div> : <div className="rounded-2xl border border-dashed border-[#D6E5DD] px-4 py-8 text-center"><p className="font-semibold text-ink">No scheduled active doses</p><p className="mt-1 text-sm text-ink-muted">Use Edit to add times to a medication.</p></div>}
            </section>
            <section className="rounded-[1.75rem] border border-surface-border bg-white p-4 shadow-card sm:p-5"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-bold text-ink">Medication details</h2><p className="text-sm text-ink-muted">Edit instructions or pause a plan.</p></div><FileText size={20} className="text-brand" /></div><div className="divide-y divide-surface-border">{filtered.map((medication) => <article key={medication.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF6F1] text-brand"><Pill size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-ink">{medication.name}</h3>{medication.strength && <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs font-medium text-ink-muted">{medication.strength}</span>}<span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${medication.active ? 'bg-[#EAF6EF] text-[#348261]' : 'bg-gray-100 text-gray-500'}`}>{medication.active ? 'Active' : 'Paused'}</span></div><p className="mt-0.5 truncate text-sm text-ink-muted">{medication.dosage_instructions || 'Dose instructions not added'}{medication.purpose ? ` · ${medication.purpose}` : ''}</p>{medication.prescription_notes && <p className="mt-1 truncate text-xs text-ink-subtle">{medication.prescription_notes}</p>}</div><div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" onClick={() => onEditMedication(medication)}><Pencil size={14} /> Edit</Button><Button variant="ghost" size="sm" isLoading={togglingId === medication.id} onClick={() => void handleToggleActive(medication)}>{medication.active ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}</Button></div></article>)}</div></section>
          </div>
          <aside className="space-y-4 2xl:sticky 2xl:top-24"><section className="overflow-hidden rounded-[1.75rem] border border-surface-border bg-white shadow-card"><div className="border-b border-surface-border px-5 py-4"><h2 className="font-bold text-ink">Add new medication</h2><p className="mt-1 text-sm text-ink-muted">Set up a medicine and its schedule.</p></div><div className="space-y-4 p-5"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFF0ED] text-[#D9776D]"><Plus size={22} /></div><p className="text-sm leading-6 text-ink-muted">Add the name, dose instructions, meal timing, and times from the prescription. You can edit or pause the plan later.</p><Button className="w-full" onClick={onOpenAddMedication}><Plus size={16} /> Open medication form</Button><div className="rounded-xl bg-[#F7FAF8] p-3 text-xs leading-5 text-[#75857B]">Use the schedule exactly as prescribed by the healthcare professional.</div></div></section>
            <section className="rounded-[1.75rem] border border-[#F3DAD6] bg-[#FFF2EF] p-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#BF7066]"><Clock3 size={15} /> Schedule summary</div><p className="mt-3 text-3xl font-extrabold text-[#3C4841]">{activeCount}</p><p className="mt-1 text-sm text-[#8C7772]">active medication {activeCount === 1 ? 'plan' : 'plans'}</p><div className="mt-4 flex flex-wrap gap-2">{timeGroups.map((group) => { const total = groups.find((item) => item.label === group)?.meds.length ?? 0; return <span key={group} className="rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-[#806E68]">{group}: {total}</span>; })}</div></section>
          </aside>
        </div>}
    </div>
  );
}
