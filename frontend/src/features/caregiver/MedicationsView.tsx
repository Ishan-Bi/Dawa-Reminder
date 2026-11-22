import { useState, useEffect } from 'react';
import { Patient, Medication } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { Pill, Plus, Clock, Utensils, PauseCircle, PlayCircle } from 'lucide-react';

interface MedicationsViewProps {
  patient: Patient | null;
  onOpenAddMedication: () => void;
}

export function MedicationsView({ patient, onOpenAddMedication }: MedicationsViewProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchMedications = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const data = await apiRequest<Medication[]>(`/patients/${patient.id}/medications`);
      setMedications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [patient?.id]);

  const handleToggleActive = async (med: Medication) => {
    setTogglingId(med.id);
    try {
      await apiRequest(`/medications/${med.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !med.active }),
      });
      fetchMedications();
    } finally {
      setTogglingId(null);
    }
  };

  if (!patient) {
    return <p className="text-gray-500">Please select or add a patient first.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header (Medico style) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#202824] flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#167C53]" /> Medications & Schedules
          </h2>
          <p className="text-sm text-gray-500">
            Configured medicine routine for <span className="font-semibold">{patient.name}</span>
          </p>
        </div>
        <Button onClick={onOpenAddMedication}>
          <Plus className="w-4 h-4" /> Add New Medication
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading medications...</p>
      ) : medications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <Pill className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-600 font-semibold">No medications configured</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Add medicines with daily schedule times and before/after food instructions.
          </p>
          <Button onClick={onOpenAddMedication} size="sm">
            <Plus className="w-4 h-4" /> Add First Medication
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med) => {
            const schedule = med.schedules && med.schedules.length > 0 ? med.schedules[0] : null;

            return (
              <div
                key={med.id}
                className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden flex flex-col justify-between ${
                  med.active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50/60'
                }`}
              >
                <div>
                  {/* Photo Banner or Icon */}
                  {med.photo_url ? (
                    <div className="h-40 w-full overflow-hidden bg-gray-100 border-b border-gray-100 relative">
                      <img
                        src={med.photo_url}
                        alt={med.name}
                        className="w-full h-full object-cover"
                      />
                      {!med.active && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                          Paused / Discontinued
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-[#E9F5EF] flex items-center justify-center text-[#167C53]">
                      <Pill className="w-10 h-10" />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{med.name}</h3>
                        {med.strength && (
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {med.strength}
                          </span>
                        )}
                      </div>
                      <Badge variant={med.active ? 'taken' : 'skipped'}>
                        {med.active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="font-medium text-gray-700">
                        {med.dosage_instructions || '1 dose'}
                        {med.purpose ? ` • For ${med.purpose}` : ''}
                      </p>
                      {med.prescription_notes && (
                        <p className="text-gray-400 italic">{med.prescription_notes}</p>
                      )}
                    </div>

                    {/* Schedule times & food */}
                    {schedule && (
                      <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#167C53]" />
                          <span>Times:</span>
                          <div className="flex flex-wrap gap-1">
                            {schedule.times.map((t, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            {schedule.food_instruction === 'before_food'
                              ? 'Before Food (खाने से पहले)'
                              : schedule.food_instruction === 'after_food'
                              ? 'After Food (खाने के बाद)'
                              : 'Any Time'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Added {new Date(med.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleToggleActive(med)}
                    disabled={togglingId === med.id}
                    className={`font-semibold inline-flex items-center gap-1 hover:underline ${
                      med.active ? 'text-amber-700' : 'text-[#167C53]'
                    }`}
                  >
                    {med.active ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" /> Pause Routine
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" /> Resume Routine
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
