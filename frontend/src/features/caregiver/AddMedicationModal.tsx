import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import type { Medication } from '@/types';
import { Plus, Trash2, Clock, Utensils, Calendar } from 'lucide-react';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number | null;
  onSuccess: () => void;
  medication?: Medication | null;
}

type FoodInstruction = 'before_food' | 'after_food' | 'any';

function todayInKolkata() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export function AddMedicationModal({
  isOpen,
  onClose,
  patientId,
  onSuccess,
  medication = null,
}: AddMedicationModalProps) {
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('');
  const [purpose, setPurpose] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [foodInstruction, setFoodInstruction] = useState<FoodInstruction | ''>('');
  const [startDate, setStartDate] = useState(todayInKolkata);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const schedule = medication?.schedules?.[0];
    setName(medication?.name ?? '');
    setStrength(medication?.strength ?? '');
    setDosage(medication?.dosage_instructions ?? '');
    setPurpose(medication?.purpose ?? '');
    setPhotoUrl(medication?.photo_url ?? '');
    setPhotoPreviewError(false);
    setTimes(schedule?.times ?? []);
    setNewTime('');
    setFoodInstruction((schedule?.food_instruction as FoodInstruction | undefined) ?? '');
    setStartDate(schedule?.start_date ?? todayInKolkata());
    setPrescriptionNotes(medication?.prescription_notes ?? '');
    setError('');
  }, [isOpen, medication?.id]);

  const addTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime].sort());
    }
  };

  const removeTime = (t: string) => {
    setTimes(times.filter((x) => x !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    if (times.length === 0) {
      setError('Please add at least one daily dose time.');
      return;
    }
    if (!foodInstruction) {
      setError('Choose the food instruction from the prescription, or select Any time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const medicationPayload = {
          name,
          strength: strength || null,
          dosage_instructions: dosage || null,
          purpose: purpose || null,
          photo_url: photoUrl || null,
          prescription_notes: prescriptionNotes || null,
      };
      const schedulePayload = {
            times,
            food_instruction: foodInstruction,
            start_date: startDate,
            active: medication?.schedules?.[0]?.active ?? true,
      };

      if (medication) {
        await apiRequest(`/medications/${medication.id}`, {
          method: 'PATCH',
          body: JSON.stringify(medicationPayload),
        });
        const existingSchedule = medication.schedules?.[0];
        if (existingSchedule) {
          await apiRequest(`/schedules/${existingSchedule.id}`, {
            method: 'PATCH',
            body: JSON.stringify(schedulePayload),
          });
        } else {
          await apiRequest(`/medications/${medication.id}/schedules`, {
            method: 'POST',
            body: JSON.stringify(schedulePayload),
          });
        }
      } else {
        await apiRequest(`/patients/${patientId}/medications`, {
          method: 'POST',
          body: JSON.stringify({ ...medicationPayload, schedule: schedulePayload }),
        });
      }

      // Reset form & notify parent
      setName('');
      setStrength('');
      setDosage('');
      setPurpose('');
      setPhotoUrl('');
      setPhotoPreviewError(false);
      setTimes([]);
      setNewTime('');
      setFoodInstruction('');
      setStartDate(todayInKolkata());
      setPrescriptionNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not save medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={medication ? `Edit ${medication.name}` : 'Add medication'} maxWidth="max-w-xl" placement="right">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </p>
        )}

        {/* Medicine Name & Strength */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700">Medicine name *</label>
            <input
              required
              placeholder="e.g. Paracetamol, Metformin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Strength</label>
            <input
              placeholder="e.g. 500mg, 10ml"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
            />
          </div>
        </div>

        {/* Dosage instructions & Purpose */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Dose instructions</label>
            <input
              placeholder="e.g. 1 tablet, 2 teaspoons"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Purpose / Disease</label>
            <input
              placeholder="e.g. Blood Pressure, Fever"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
            />
          </div>
        </div>

        {/* Photo URL */}
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Medicine photo URL (optional)</label>
          <input
            placeholder="https://example.com/medicine-photo.jpg"
            value={photoUrl}
            onChange={(e) => { setPhotoUrl(e.target.value); setPhotoPreviewError(false); }}
            className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
          />
          {photoUrl && !photoPreviewError && (
            <img src={photoUrl} alt={`${name || 'Medicine'} preview`} onError={() => setPhotoPreviewError(true)} className="mt-2 h-24 w-24 rounded-xl border border-surface-border object-cover" />
          )}
          {photoPreviewError && <p className="text-xs text-status-missed-text">The image could not be loaded. Check the URL.</p>}
        </div>

        {/* Daily Schedule Times */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#167C53]" /> Daily Dose Times (IST) *
            </label>
            <span className="text-[11px] text-gray-500">Asia/Kolkata</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 shadow-2xs"
              >
                {t}
                <button
                  type="button"
                  aria-label={`Remove dose time ${t}`}
                  onClick={() => removeTime(t)}
                  className="grid h-8 w-8 place-items-center rounded-btn text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="time"
              aria-label="New daily dose time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-white border text-xs font-semibold rounded-xl px-3 py-1.5 outline-none"
            />
            <Button type="button" size="sm" variant="outline" onClick={addTime}>
              <Plus className="w-3.5 h-3.5" /> Add Time
            </Button>
          </div>
          {times.length === 0 && <p className="text-xs text-ink-muted">Add at least one time to create the schedule.</p>}
        </div>

        {/* Food Instructions */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-600" /> Food Instruction
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'before_food', label: 'Before food' },
              { id: 'after_food', label: 'After food' },
              { id: 'any', label: 'Any time' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                aria-pressed={foodInstruction === opt.id}
                onClick={() => setFoodInstruction(opt.id as FoodInstruction)}
                className={`min-h-11 py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                  foodInstruction === opt.id
                    ? 'border-[#167C53] bg-[#E9F5EF] text-[#167C53]'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Date & Doctor/Prescription Notes */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-500" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Prescription notes</label>
            <input
              placeholder="e.g. Dr. Sharma prescribed for 14 days"
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
            <Button type="submit" isLoading={loading}>
            {medication ? 'Save changes' : 'Save medication'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
