import { useMemo, useState } from 'react';
import type { Patient, Dose } from '@/types';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { AlertCircle, ArrowUpRight, CalendarDays, Check, CheckCircle2, Clock3, Heart, Pill, Plus, QrCode, SkipForward, Sparkles, X } from 'lucide-react';

interface DashboardViewProps {
  patient: Patient | null;
  doses: Dose[];
  onRefreshDoses: () => void;
  onOpenAddMedication: () => void;
  onOpenQrModal: () => void;
  onOpenAddPatient: () => void;
}

const timeLabel = (value: string) => new Date(value).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

export function DashboardView({ patient, doses, onRefreshDoses, onOpenAddMedication, onOpenQrModal, onOpenAddPatient }: DashboardViewProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const counts = useMemo(() => ({
    taken: doses.filter((dose) => dose.status === 'taken').length,
    pending: doses.filter((dose) => dose.status === 'pending').length,
    skipped: doses.filter((dose) => dose.status === 'skipped').length,
    missed: doses.filter((dose) => dose.status === 'missed').length,
  }), [doses]);
  const sorted = useMemo(() => [...doses].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)), [doses]);
  const nextDose = sorted.find((dose) => dose.status === 'pending');
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const date = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' });

  const markDose = async (dose: Dose, status: 'taken' | 'skipped') => {
    setUpdatingId(dose.id);
    setError(null);
    try {
      await apiRequest(`/doses/${dose.id}`, { method: 'PATCH', body: JSON.stringify({ status, acted_by: 'caregiver' }) });
      await onRefreshDoses();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this dose. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!patient) return (
    <section className="mx-auto my-8 max-w-2xl rounded-[2rem] border border-[#DBEAE4] bg-white px-6 py-12 text-center shadow-[0_18px_60px_-42px_rgba(29,71,55,.3)] sm:px-12">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E7F4EC] text-[#328663]"><Heart size={28} /></span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#21382D]">Your family care space</h1>
      <p className="mx-auto mt-3 max-w-md leading-7 text-[#71847A]">Add a patient to start building a clear, shared medication routine.</p>
      <Button onClick={onOpenAddPatient} size="lg" className="mt-6"><Plus size={18} /> Add a patient</Button>
    </section>
  );

  const completion = doses.length ? Math.round((counts.taken / doses.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-[#E1ECE6] bg-gradient-to-br from-white via-white to-[#EEF8F3] p-5 shadow-[0_18px_60px_-46px_rgba(29,71,55,.28)] sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4D9B76]"><Sparkles size={15} /> Family care overview</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#20362B] sm:text-4xl">{greeting}, {patient.name}</h1><p className="mt-2 flex items-center gap-2 text-sm text-[#78887F]"><CalendarDays size={16} />{date}</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={onOpenQrModal}><QrCode size={16} /> Share patient view</Button><Button onClick={onOpenAddMedication}><Plus size={17} /> Add medication</Button></div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Scheduled today', value: doses.length, icon: Pill, tone: 'bg-[#E9F4EF] text-[#438866]' },
          { label: 'Taken', value: counts.taken, icon: CheckCircle2, tone: 'bg-[#E7F5EF] text-[#338365]' },
          { label: 'Upcoming', value: counts.pending, icon: Clock3, tone: 'bg-[#FFF5DF] text-[#AF8135]' },
          { label: 'Missed', value: counts.missed, icon: AlertCircle, tone: 'bg-[#FFF0ED] text-[#C87468]' },
        ].map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-[1.5rem] border border-[#E5EDE8] bg-white p-4 shadow-[0_10px_35px_-30px_rgba(30,70,53,.3)] sm:p-5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span><p className="mt-4 text-2xl font-bold text-[#26392F]">{value}</p><p className="mt-0.5 text-xs font-medium text-[#829087] sm:text-sm">{label}</p></article>)}
      </div>

      {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.8fr)]">
        <section className="overflow-hidden rounded-[1.75rem] border border-[#E0EBE5] bg-white shadow-[0_16px_55px_-40px_rgba(30,70,53,.32)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#EDF2EE] px-5 py-4 sm:px-6"><div><h2 className="text-lg font-bold text-[#283A30]">Today&apos;s schedule</h2><p className="mt-0.5 text-sm text-[#87948B]">Dose updates for {patient.name}</p></div><span className="rounded-full bg-[#EFF7F2] px-3 py-1.5 text-xs font-semibold text-[#58866C]">{date}</span></div>
          {sorted.length === 0 ? <div className="px-6 py-12 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF7F2] text-[#579979]"><Pill size={25} /></span><h3 className="mt-4 font-bold text-[#2B3D32]">No doses on today&apos;s schedule</h3><p className="mt-1 text-sm text-[#839087]">Add medication and its prescribed dose times to see the routine here.</p><Button onClick={onOpenAddMedication} variant="secondary" className="mt-4"><Plus size={16} /> Add medication</Button></div> : <div className="divide-y divide-[#EDF2EE]">{sorted.map((dose) => {
            const isTaken = dose.status === 'taken';
            const isSkipped = dose.status === 'skipped';
            const done = isTaken || isSkipped;
            return <article key={dose.id} className="flex flex-col gap-4 px-4 py-4 transition hover:bg-[#FCFDFC] sm:flex-row sm:items-center sm:px-6">
              <time className="w-[4.7rem] shrink-0 text-sm font-bold tabular-nums text-[#608173]">{timeLabel(dose.scheduled_at)}</time>
              {dose.medication_photo ? <img src={dose.medication_photo} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-[#E5ECE8] object-cover" /> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#EAF5EF] text-[#529373]"><Pill size={19} /></span>}
              <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-[#293B31]">{dose.medication_name}</h3><p className="mt-0.5 text-sm text-[#849188]">{dose.medication_instructions || 'Scheduled dose'}{dose.medication_strength ? ` · ${dose.medication_strength}` : ''}</p></div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">{done ? <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${isTaken ? 'bg-[#EAF6EF] text-[#378362]' : 'bg-[#F0F2F1] text-[#78847D]'}`}>{isTaken ? <CheckCircle2 size={14} /> : <SkipForward size={14} />}{isTaken ? 'Taken' : 'Skipped'}</span> : <><button type="button" aria-label={`Mark ${dose.medication_name} taken`} disabled={updatingId === dose.id} onClick={() => void markDose(dose, 'taken')} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#51AF8E] px-3 text-xs font-bold text-white transition hover:bg-[#3E9879] disabled:opacity-60"><Check size={15} />Taken</button><button type="button" aria-label={`Skip ${dose.medication_name}`} disabled={updatingId === dose.id} onClick={() => void markDose(dose, 'skipped')} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#E3EAE5] bg-white px-3 text-xs font-semibold text-[#738178] transition hover:bg-[#F6F9F7] disabled:opacity-60"><X size={15} />Skip</button></>}</div>
            </article>;
          })}</div>}
        </section>

        <aside className="space-y-5">
          <section className="rounded-[1.75rem] border border-[#E0EBE5] bg-white p-5 shadow-[0_16px_55px_-40px_rgba(30,70,53,.32)] sm:p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#293B31]">Next reminder</h2><span className="grid h-9 w-9 place-items-center rounded-full bg-[#EDF7F1] text-[#559676]"><Clock3 size={18} /></span></div>
            {nextDose ? <><p className="mt-6 text-4xl font-extrabold tracking-tight text-[#4DAE91]">{timeLabel(nextDose.scheduled_at)}</p><p className="mt-2 font-semibold text-[#36483D]">{nextDose.medication_name}</p><p className="text-sm text-[#849188]">{nextDose.medication_instructions || 'Scheduled dose'}</p></> : <><p className="mt-5 font-bold text-[#34473C]">You&apos;re up to date</p><p className="mt-1 text-sm text-[#849188]">No pending doses for today.</p></>}
            <button type="button" onClick={onOpenQrModal} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#D8E9DF] bg-[#F5FAF7] px-4 text-sm font-semibold text-[#4C8769] transition hover:bg-[#EDF6F0]"><QrCode size={16} /> Open patient view <ArrowUpRight size={15} /></button>
          </section>
          <section className="rounded-[1.75rem] border border-[#E0EBE5] bg-white p-5 shadow-[0_16px_55px_-40px_rgba(30,70,53,.32)] sm:p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-[#293B31]">Today&apos;s progress</h2><p className="mt-0.5 text-sm text-[#87948B]">Based on recorded doses</p></div><span className="text-2xl font-extrabold text-[#4DAE91]">{doses.length ? `${completion}%` : '—'}</span></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EEF2EF]"><div className="h-full rounded-full bg-[#5BB99A] transition-all" style={{ width: `${completion}%` }} /></div>
            <div className="mt-3 flex justify-between text-xs font-medium text-[#849188]"><span>{counts.taken} taken</span><span>{counts.pending} upcoming{counts.skipped ? ` · ${counts.skipped} skipped` : ''}</span></div>
          </section>
        </aside>
      </div>
      <p className="px-2 text-center text-xs text-[#8A9990]">A reminder tool for family support · Follow the healthcare professional&apos;s instructions.</p>
    </div>
  );
}
