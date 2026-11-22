import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { Patient } from '@/types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPatient: Patient) => void;
}

export function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const patient = await apiRequest<Patient>('/patients', {
        method: 'POST',
        body: JSON.stringify({
          name,
          age: age ? parseInt(age, 10) : null,
          preferred_language: 'en',
          notes: notes || null,
        }),
      });

      setName('');
      setAge('');
      setNotes('');
      onSuccess(patient);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Family Member / Patient">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border">{error}</p>}

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Patient Full Name *</label>
          <input
            required
            placeholder="e.g. Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Age</label>
            <input
              type="number"
              placeholder="e.g. 72"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
            />
          </div>

        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Health Notes / Instructions</label>
          <textarea
            rows={3}
            placeholder="e.g. Needs water with all pills, doctor contact number"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-sm border rounded-xl p-3 focus:ring-2 focus:ring-[#167C53]/30 outline-none"
          />
        </div>

        <div className="pt-4 border-t flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Patient Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
