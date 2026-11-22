import { useState } from 'react';
import { Patient } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { Users, Plus, QrCode, ExternalLink, RefreshCw, UserCheck, Trash2 } from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  activePatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onRefreshPatients: () => void;
  onOpenAddPatient: () => void;
  onOpenQrModal: (patient: Patient) => void;
}

export function PatientsView({
  patients,
  activePatient,
  onSelectPatient,
  onRefreshPatients,
  onOpenAddPatient,
  onOpenQrModal,
}: PatientsViewProps) {
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleRegenerateToken = async (patientId: number) => {
    if (!confirm('Regenerating access token will revoke the existing QR code and link. Continue?')) {
      return;
    }
    setRegeneratingId(patientId);
    try {
      await apiRequest(`/patients/${patientId}/regenerate-token`, { method: 'POST' });
      onRefreshPatients();
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = async (patientId: number) => {
    if (!confirm('Are you sure you want to delete this patient profile and all their medications?')) {
      return;
    }
    setDeletingId(patientId);
    try {
      await apiRequest(`/patients/${patientId}`, { method: 'DELETE' });
      onRefreshPatients();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#202824] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#167C53]" /> Patient Profiles
          </h2>
          <p className="text-sm text-gray-500">
            Manage elderly family members and their personalized access links.
          </p>
        </div>
        <Button onClick={onOpenAddPatient}>
          <Plus className="w-4 h-4" /> Add Patient
        </Button>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <p className="text-gray-500 font-medium">No patients added yet.</p>
          <Button onClick={onOpenAddPatient} size="sm">
            <Plus className="w-4 h-4" /> Add Your First Patient
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {patients.map((p) => {
            const isActive = activePatient?.id === p.id;
            const patientUrl = `${window.location.origin}/p/${p.access_token}`;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-6 border transition shadow-sm space-y-4 ${
                  isActive ? 'border-[#167C53] ring-1 ring-[#167C53]' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#E9F5EF] text-[#167C53] font-bold text-lg flex items-center justify-center">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                        {isActive && (
                          <Badge variant="primary" className="text-[10px]">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {p.age ? `${p.age} years old` : 'Age not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenQrModal(p)}
                      title="View QR Code"
                      className="p-2 text-gray-500 hover:text-[#167C53] hover:bg-emerald-50 rounded-lg transition"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      title="Delete Patient"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    {p.notes}
                  </p>
                )}

                {/* Patient Access Link Box */}
                <div className="bg-[#F8FAF9] p-3 rounded-xl border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Patient Secret URL (No Password)</span>
                    <button
                      onClick={() => handleRegenerateToken(p.id)}
                      disabled={regeneratingId === p.id}
                      className="text-[#167C53] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className={`w-3 h-3 ${regeneratingId === p.id ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={patientUrl}
                      className="w-full bg-white text-xs border rounded-lg px-2.5 py-1.5 text-gray-600 select-all font-mono"
                    />
                    <a
                      href={`/p/${p.access_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-600 hover:text-[#167C53] bg-white border rounded-lg hover:bg-gray-50 shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenQrModal(p)}
                  >
                    <QrCode className="w-3.5 h-3.5" /> Show QR Code
                  </Button>

                  {!isActive && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectPatient(p)}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Set Active
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
