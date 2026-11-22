import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { Plus, Trash2, Clock, Utensils, Calendar } from 'lucide-react';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number | null;
  onSuccess: () => void;
}

export function AddMedicationModal({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: AddMedicationModalProps) {
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('1 गोली (1 tablet)');
  const [purpose, setPurpose] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00', '20:30']);
  const [newTime, setNewTime] = useState('13:00');
  const [foodInstruction, setFoodInstruction] = useState<'before_food' | 'after_food' | 'any'>('after_food');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    setLoading(true);
    setError('');

    try {
      await apiRequest(`/patients/${patientId}/medications`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          strength: strength || null,
          dosage_instructions: dosage,
          purpose: purpose || null,
          photo_url: photoUrl || null,
          prescription_notes: prescriptionNotes || null,
          schedule: {
            times,
            food_instruction: foodInstruction,
            start_date: startDate,
            active: true,
          },
        }),
      });

      // Reset form & notify parent
      setName('');
      setStrength('');
      setPurpose('');
      setPhotoUrl('');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Medication" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </p>
        )}

        {/* Medicine Name & Strength */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-700">Medicine Name *</label>
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Dosage Instructions</label>
            <input
              placeholder="e.g. 1 गोली, 2 चम्मच"
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
          <label className="text-xs font-bold text-gray-700">Medicine Photo URL (Optional)</label>
          <input
            placeholder="https://... photo link (shown to elderly patient for visual recognition)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
          />
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
                  onClick={() => removeTime(t)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-white border text-xs font-semibold rounded-xl px-3 py-1.5 outline-none"
            />
            <Button type="button" size="sm" variant="outline" onClick={addTime}>
              <Plus className="w-3.5 h-3.5" /> Add Time
            </Button>
          </div>
        </div>

        {/* Food Instructions */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-600" /> Food Instruction
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'before_food', label: 'Before Food (खाने से पहले)' },
              { id: 'after_food', label: 'After Food (खाने के बाद)' },
              { id: 'any', label: 'Any Time (कभी भी)' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setFoodInstruction(opt.id as any)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
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
        <div className="grid grid-cols-2 gap-3">
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
            <label className="text-xs font-bold text-gray-700">Doctor / Prescription Notes</label>
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
            Save Medication
          </Button>
        </div>
      </form>
    </Modal>
  );
}
