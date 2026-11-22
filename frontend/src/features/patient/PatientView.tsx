import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Dose } from '@/types';
import { apiRequest } from '@/lib/api';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Volume2, X, AlertCircle, Pill } from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';

interface PatientTodayData {
  patient: { id: number; name: string };
  doses: Dose[];
  date: string;
}

function getTime(value: string) {
  return new Date(value).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function getWeek() {
  const now = new Date();
  const local = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const start = new Date(local);
  start.setDate(local.getDate() - ((local.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { key: date.toDateString(), day: date.toLocaleDateString('en-IN', { weekday: 'short' }), date: date.getDate(), today: date.toDateString() === local.toDateString() };
  });
}

function dayPart(value: string) {
  const hour = Number(value.slice(0, 2));
  if (hour < 11) return 'Morning';
  if (hour < 16) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

export function PatientView() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PatientTodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchTodayDoses = async () => {
    if (!token) return;
    try {
      const result = await apiRequest<PatientTodayData>(`/p/${token}/today`);
      setData(result);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This link may have expired. Please ask your family member for an updated link.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { document.documentElement.lang = 'en'; }, []);
  useEffect(() => { void fetchTodayDoses(); }, [token]);

  const speak = (dose: Dose) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const phrase = `At ${getTime(dose.scheduled_at)}, ${dose.medication_name}, ${dose.medication_instructions || 'your scheduled dose'}. ${dose.food_instruction === 'before_food' ? 'Before food.' : dose.food_instruction === 'after_food' ? 'After food.' : ''}`;
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };

  const handleAction = async (dose: Dose, action: 'taken' | 'skipped') => {
    if (!token) return;
    setActionLoadingId(dose.id);
    setActionError(null);
    try {
      await apiRequest(`/p/${token}/doses/${dose.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ client_event_id: `cli_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }),
      });
      await fetchTodayDoses();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not update this dose. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading || error || !data) {
    return (
      <PatientLayout>
        <div className="grid min-h-[60vh] place-items-center px-4">
          {loading ? <div role="status" className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" /><p className="mt-4 text-lg font-semibold text-ink">Loading today&apos;s schedule…</p></div> : <section role="alert" className="max-w-md rounded-3xl border border-status-missed-border bg-white p-8 text-center shadow-card"><AlertCircle className="mx-auto h-12 w-12 text-status-missed" /><h1 className="mt-3 text-2xl font-bold text-ink">Link unavailable</h1><p className="mt-2 text-ink-muted">{error || 'Please request an updated patient link.'}</p></section>}
        </div>
      </PatientLayout>
    );
  }

  const week = getWeek();
  const groups = ['Morning', 'Afternoon', 'Evening', 'Night'].map((label) => ({ label, doses: data.doses.filter((dose) => dayPart(dose.scheduled_at.slice(11, 16)) === label) })).filter((group) => group.doses.length > 0);
  const finishedCount = data.doses.filter((dose) => dose.status !== 'pending').length;
  const todayLabel = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <PatientLayout>
      <div className="space-y-6 pb-4">
        <section className="overflow-hidden rounded-[2rem] bg-[#54B5A4] px-5 py-5 text-white shadow-[0_18px_45px_-28px_rgba(24,105,91,.55)] sm:px-8 sm:py-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-bold">{data.patient.name.slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0"><p className="text-sm text-white/80">Your medicine plan</p><h1 className="truncate text-2xl font-bold sm:text-3xl">Hello, {data.patient.name}</h1></div>
            </div>
            <span className="hidden rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold sm:block">{todayLabel}</span>
          </div>
          <div className="mt-6 flex items-end justify-between gap-3">
            <div><p className="text-sm font-medium text-white/80">Today&apos;s medicines</p><p className="mt-1 text-3xl font-extrabold">{data.doses.length} <span className="text-lg font-semibold text-white/80">{data.doses.length === 1 ? 'dose' : 'doses'}</span></p></div>
            <p className="text-right text-sm font-semibold text-white/90">{finishedCount} of {data.doses.length} recorded</p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${data.doses.length ? (finishedCount / data.doses.length) * 100 : 0}%` }} /></div>
        </section>

        <section aria-label="This week" className="rounded-[1.75rem] border border-[#D9ECE8] bg-white px-3 py-4 shadow-sm sm:px-5">
          <div className="mb-3 flex items-center justify-between px-1"><div><h2 className="font-bold text-[#263A35]">Your schedule</h2><p className="text-sm text-[#78918A]">{todayLabel}</p></div><div className="flex gap-1 text-[#7B9991]" aria-hidden="true"><ChevronLeft size={18} /><ChevronRight size={18} /></div></div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">{week.map((day) => <div key={day.key} aria-current={day.today ? 'date' : undefined} className={`flex min-h-[68px] flex-col items-center justify-center rounded-2xl border text-sm ${day.today ? 'border-[#54B5A4] bg-[#54B5A4] font-bold text-white shadow-sm' : 'border-[#E6EFED] bg-[#FAFCFB] text-[#658078]'}`}><span className="text-xs">{day.day}</span><span className="mt-1 text-lg">{day.date}</span>{day.today && <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider">Today</span>}</div>)}</div>
        </section>

        {actionError && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">{actionError}</p>}

        {data.doses.length === 0 ? (
          <section className="rounded-[1.75rem] border border-[#D9ECE8] bg-white px-6 py-12 text-center shadow-sm"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E9F7F4] text-[#54A999]"><CheckCircle2 size={30} /></span><h2 className="mt-4 text-xl font-bold text-[#263A35]">You&apos;re all set for today</h2><p className="mt-2 text-[#78918A]">There are no doses scheduled today.</p></section>
        ) : (
          <div className="space-y-5">{groups.map((group) => <section key={group.label} className="space-y-3"><h2 className="px-1 text-lg font-bold text-[#263A35]">{group.label}</h2>{group.doses.map((dose) => {
            const taken = dose.status === 'taken';
            const skipped = dose.status === 'skipped';
            const completed = taken || skipped;
            return <article key={dose.id} className={`rounded-[1.65rem] border p-4 shadow-sm transition sm:p-5 ${taken ? 'border-[#A9DBD2] bg-[#F0FAF8]' : skipped ? 'border-[#E7EAE9] bg-[#F7F8F8]' : 'border-[#D6EAE5] bg-[#EAF8F5]'}`}>
              <div className="flex items-start gap-3 sm:gap-4">
                {dose.medication_photo ? <img src={dose.medication_photo} alt="" className="h-14 w-14 shrink-0 rounded-2xl border border-white object-cover sm:h-16 sm:w-16" /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-[#56AE9F] sm:h-16 sm:w-16"><Pill size={25} /></span>}
                <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-lg font-bold text-[#253B35] sm:text-xl">{dose.medication_name}</h3><p className="mt-0.5 text-sm font-medium text-[#718A83]">{dose.medication_strength || dose.medication_instructions || 'Scheduled dose'}</p></div><button type="button" aria-label={`Read ${dose.medication_name} instructions aloud`} onClick={() => speak(dose)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#4B9E90] hover:bg-[#D8F0EB]"><Volume2 size={19} /></button></div>
                  <div className="mt-3 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#38554D]"><Clock3 size={15} />{getTime(dose.scheduled_at)}</span>{dose.food_instruction && dose.food_instruction !== 'any' && <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#66847B]">{dose.food_instruction === 'before_food' ? 'Before food' : 'After food'}</span>}{dose.medication_purpose && <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#66847B]">{dose.medication_purpose}</span>}</div>
                </div>
              </div>
              {completed ? <div className={`mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl font-bold ${taken ? 'bg-[#D8F1EB] text-[#287B6C]' : 'bg-[#ECEFEE] text-[#65746F]'}`}>{taken ? <CheckCircle2 size={20} /> : <X size={19} />}{taken ? 'Taken' : 'Skipped'}</div> : <div className="mt-4 grid grid-cols-[1.3fr_1fr] gap-2.5"><button type="button" disabled={actionLoadingId === dose.id} onClick={() => void handleAction(dose, 'taken')} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#51B4A2] px-3 text-base font-bold text-white shadow-sm transition hover:bg-[#3D9F8E] disabled:opacity-60 sm:text-lg"><Check size={21} strokeWidth={3} />{actionLoadingId === dose.id ? 'Saving…' : 'Taken'}</button><button type="button" disabled={actionLoadingId === dose.id} onClick={() => void handleAction(dose, 'skipped')} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#E3A8A2] bg-white px-3 text-base font-semibold text-[#C76D67] transition hover:bg-[#FFF4F2] disabled:opacity-60 sm:text-lg"><X size={20} />Skip</button></div>}
            </article>;
          })}</section>)}</div>
        )}
        <p className="px-2 text-center text-xs leading-relaxed text-[#82958F]">Follow the directions given by your healthcare professional. This reminder does not replace medical advice.</p>
      </div>
    </PatientLayout>
  );
}
