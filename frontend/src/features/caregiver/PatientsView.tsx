import { useState } from 'react';
import type { Patient } from '@/types';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PatientCard } from '@/components/domain/PatientCard';
import { Plus, Users } from 'lucide-react';

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
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRegenerateToken = async (patient: Patient) => {
    if (!window.confirm(`Create a new access link for ${patient.name}? The old link and QR code will stop working.`)) return;
    setRegeneratingId(patient.id);
    setActionError(null);
    try {
      await apiRequest(`/patients/${patient.id}/regenerate-token`, { method: 'POST' });
      await onRefreshPatients();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not regenerate the access link.');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!window.confirm(`Delete ${patient.name}'s profile and medication data? This cannot be undone.`)) return;
    setDeletingId(patient.id);
    setActionError(null);
    try {
      await apiRequest(`/patients/${patient.id}`, { method: 'DELETE' });
      await onRefreshPatients();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not delete this patient.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Family care</p>
          <h1 className="mt-1 flex items-center gap-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
            <Users aria-hidden="true" className="h-6 w-6 text-brand" /> Patients
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Manage profiles and patient access links.</p>
        </div>
        <Button onClick={onOpenAddPatient}>
          <Plus aria-hidden="true" size={16} /> Add patient
        </Button>
      </header>

      {actionError && <p role="alert" className="rounded-card border border-status-missed-border bg-status-missed-bg px-4 py-3 text-sm text-status-missed-text">{actionError}</p>}

      {patients.length === 0 ? (
        <section className="rounded-card border border-surface-border bg-surface shadow-card">
          <EmptyState
            icon={Users}
            heading="Add your first patient"
            subtext="Create a profile to set up their medication schedule and share a patient view."
            action={<Button onClick={onOpenAddPatient}><Plus aria-hidden="true" size={16} /> Add patient</Button>}
          />
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isActive={activePatient?.id === patient.id}
              isDeleting={deletingId === patient.id}
              isRegenerating={regeneratingId === patient.id}
              onSelect={onSelectPatient}
              onShowQr={onOpenQrModal}
              onDelete={handleDelete}
              onRegenerate={handleRegenerateToken}
            />
          ))}
        </div>
      )}
    </div>
  );
}
