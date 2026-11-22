import { useState } from 'react';
import { Patient, Dose } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pill,
  Calendar,
  Plus,
  QrCode,
  Check,
  X,
} from 'lucide-react';

interface DashboardViewProps {
  patient: Patient | null;
  doses: Dose[];
  onRefreshDoses: () => void;
  onOpenAddMedication: () => void;
  onOpenQrModal: () => void;
  onOpenAddPatient: () => void;
}

export function DashboardView({
  patient,
  doses,
  onRefreshDoses,
  onOpenAddMedication,
  onOpenQrModal,
  onOpenAddPatient,
}: DashboardViewProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!patient) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-[#E9F5EF] text-[#167C53] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          DR
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome to DawaReminder</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Start by adding a family member or elderly patient. You will configure their medication routine once, and they will simply follow it with big visual buttons.
        </p>
        <Button onClick={onOpenAddPatient} size="lg" className="mt-4">
          <Plus className="w-5 h-5" /> Add Your First Patient
        </Button>
      </div>
    );
  }

  // Calculate metrics
  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === 'taken').length;
  const pendingDoses = doses.filter((d) => d.status === 'pending').length;
  const missedDoses = doses.filter((d) => d.status === 'missed').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : null;
  const pendingQueue = doses
    .filter((dose) => dose.status === 'pending')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const now = Date.now();
  const nextDose = pendingQueue.find((dose) => new Date(dose.scheduled_at).getTime() >= now) ?? pendingQueue[0] ?? null;

  // Format scheduled_at to IST HH:MM display
  const formatTime = (isoString: string) => {
    try {
      const dt = new Date(isoString);
      return dt.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const handleUpdateStatus = async (doseId: number, status: 'taken' | 'skipped') => {
    setUpdatingId(doseId);
    setActionError(null);
    try {
      await apiRequest(`/doses/${doseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, acted_by: 'caregiver' }),
      });
      onRefreshDoses();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update this dose. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="overflow-hidden rounded-3xl bg-[#123D2C] p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Care overview</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Today for {patient.name}</h2>
            <p className="mt-2 text-sm text-emerald-100">
              {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="md" onClick={onOpenQrModal} className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20 hover:!text-white">
              <QrCode aria-hidden="true" className="h-4 w-4" /> Share patient link
            </Button>
            <Button size="md" onClick={onOpenAddMedication} className="!bg-white !text-[#123D2C] hover:!bg-emerald-50">
              <Plus aria-hidden="true" className="h-4 w-4" /> Add medication
            </Button>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15"><Clock aria-hidden="true" className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Next pending dose</p>
              {nextDose ? (
                <p className="mt-0.5 font-bold">{nextDose.medication_name} {nextDose.medication_strength ? `· ${nextDose.medication_strength}` : ''}</p>
              ) : (
                <p className="mt-0.5 font-bold">No pending doses today</p>
              )}
            </div>
          </div>
          {nextDose && <p className="text-xl font-extrabold tabular-nums sm:text-2xl">{formatTime(nextDose.scheduled_at)}</p>}
        </div>
      </section>

      {actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#167C53] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Taken</p>
            <p className="text-2xl font-bold text-gray-900">{takenDoses}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pendingDoses}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Missed</p>
            <p className="text-2xl font-bold text-gray-900">{missedDoses}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700">
            {adherenceRate === null ? '—' : `${adherenceRate}%`}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adherence</p>
            <p className="text-sm font-semibold text-gray-800">{totalDoses ? `${takenDoses} of ${totalDoses}` : 'No doses yet'}</p>
          </div>
        </div>
      </div>

      {/* Main Routine & Timeline (Pharmax style) */}
      <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
            <Calendar className="w-5 h-5 text-[#167C53]" />
            <span>Today&apos;s Schedule</span>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {doses.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Pill className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-600 font-semibold">No doses scheduled for today</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Add medications and set their daily schedule (e.g. Morning 08:00 AM, Night 09:00 PM) to generate doses automatically.
            </p>
            <Button size="sm" onClick={onOpenAddMedication} className="mt-2">
              <Plus className="w-4 h-4" /> Add Medication
            </Button>
          </div>
        ) : (
          <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {doses.map((dose) => {
              const isTaken = dose.status === 'taken';
              const isMissed = dose.status === 'missed';
              const isSkipped = dose.status === 'skipped';

              return (
                <div key={dose.id} className="relative group">
                  {/* Timeline Node Bullet (Pharmax style) */}
                  <div
                    className={`absolute -left-6 md:-left-8 top-5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition ${
                      isTaken
                        ? 'border-[#167C53] text-[#167C53]'
                        : isMissed
                        ? 'border-red-500 text-red-500'
                        : isSkipped
                        ? 'border-gray-400 text-gray-400'
                        : 'border-amber-400 text-amber-500'
                    }`}
                  >
                    {isTaken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {isMissed && <X className="w-3.5 h-3.5 stroke-[3]" />}
                    {isSkipped && <div className="w-2 h-2 rounded-full bg-gray-400" />}
                    {!isTaken && !isMissed && !isSkipped && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>

                  {/* Dose Card (Pharmax & Medico style) */}
                  <div className="bg-[#F8FAF9] hover:bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-4 md:p-5 transition shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {dose.medication_photo ? (
                          <img
                            src={dose.medication_photo}
                            alt={dose.medication_name || 'Medicine'}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#E9F5EF] text-[#167C53] flex items-center justify-center font-bold">
                            <Pill className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-base">
                              {dose.medication_name}
                            </h4>
                            {dose.medication_strength && (
                              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {dose.medication_strength}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {dose.medication_instructions || 'Take 1 dose'}
                            {dose.medication_purpose ? ` • For ${dose.medication_purpose}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                          {formatTime(dose.scheduled_at)}
                        </span>
                        <Badge
                          variant={
                            dose.food_instruction === 'before_food'
                              ? 'foodBefore'
                              : dose.food_instruction === 'after_food'
                              ? 'foodAfter'
                              : 'neutral'
                          }
                        >
                          {dose.food_instruction === 'before_food'
                            ? 'Before food'
                            : dose.food_instruction === 'after_food'
                            ? 'After food'
                            : 'Any Time'}
                        </Badge>
                      </div>
                    </div>

                    {/* Status & Caregiver Action Controls */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant={dose.status}>
                          {dose.status.toUpperCase()}
                        </Badge>
                        {dose.acted_at && (
                          <span className="text-gray-400">
                            Recorded at {formatTime(dose.acted_at)} by {dose.acted_by}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {dose.status !== 'taken' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={updatingId === dose.id}
                            onClick={() => handleUpdateStatus(dose.id, 'taken')}
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Taken
                          </Button>
                        )}
                        {dose.status !== 'skipped' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            isLoading={updatingId === dose.id}
                            onClick={() => handleUpdateStatus(dose.id, 'skipped')}
                          >
                            Skip
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
