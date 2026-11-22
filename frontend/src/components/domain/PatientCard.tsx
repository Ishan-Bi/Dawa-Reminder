import { ExternalLink, QrCode, RefreshCw, Trash2, User, UserCheck } from 'lucide-react';
import type { Patient } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { isLocalOnlyPatientUrl, patientAccessUrl } from '@/lib/patientAccess';

interface PatientCardProps {
  patient: Patient;
  isActive?: boolean;
  isDeleting?: boolean;
  isRegenerating?: boolean;
  onSelect?: (patient: Patient) => void;
  onShowQr?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onRegenerate?: (patient: Patient) => void;
}

export function PatientCard({
  patient,
  isActive = false,
  isDeleting = false,
  isRegenerating = false,
  onSelect,
  onShowQr,
  onDelete,
  onRegenerate,
}: PatientCardProps) {
  const patientUrl = patientAccessUrl(patient.access_token);

  return (
    <article className={`overflow-hidden rounded-card border bg-surface shadow-card ${isActive ? 'border-brand ring-1 ring-brand/20' : 'border-surface-border'}`}>
      <div className="flex items-start gap-3 p-5">
        <Avatar name={patient.name} size="md" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-heading text-base font-bold text-ink">{patient.name}</h3>
            {isActive && <Badge variant="brand">Active</Badge>}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
            <User aria-hidden="true" size={14} /> {patient.age ? `${patient.age} years old` : 'Age not specified'}
          </p>
        </div>
        {onSelect && !isActive && (
          <Button variant="outline" size="sm" onClick={() => onSelect(patient)}>
            <UserCheck aria-hidden="true" size={14} /> Set active
          </Button>
        )}
      </div>

      {patient.notes && <p className="mx-5 mb-4 rounded-btn bg-surface-raised px-3 py-2 text-sm text-ink-muted">{patient.notes}</p>}

      <div className="mx-5 rounded-card border border-surface-border bg-surface-raised p-3">
        <p className="text-xs font-semibold text-ink-muted">Patient access link</p>
        <div className="mt-2 flex gap-2">
          <input readOnly aria-label={`Patient access link for ${patient.name}`} value={patientUrl} className="min-w-0 flex-1 rounded-btn border border-surface-border bg-surface px-2.5 py-2 text-xs text-ink-muted" />
          <a href={patientUrl} target="_blank" rel="noreferrer" aria-label={`Open patient view for ${patient.name}`} title="Open patient view" className="grid h-10 w-10 shrink-0 place-items-center rounded-btn border border-surface-border bg-surface text-ink-muted hover:text-brand">
            <ExternalLink aria-hidden="true" size={16} />
          </a>
        </div>
        {isLocalOnlyPatientUrl() && <p className="mt-2 text-xs leading-5 text-amber-800">This link uses localhost and only works on this computer. Open DawaReminder using your computer&apos;s network address before sharing it to a phone.</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 p-5 pt-4">
        <div className="flex flex-wrap gap-2">
          {onShowQr && <Button variant="secondary" size="sm" onClick={() => onShowQr(patient)}><QrCode aria-hidden="true" size={14} /> Show QR</Button>}
          {onRegenerate && <Button variant="outline" size="sm" disabled={isRegenerating} onClick={() => onRegenerate(patient)}><RefreshCw aria-hidden="true" size={14} className={isRegenerating ? 'animate-spin' : ''} /> Regenerate link</Button>}
        </div>
        {onDelete && <Button variant="ghost" size="sm" disabled={isDeleting} onClick={() => onDelete(patient)} className="text-status-missed"><Trash2 aria-hidden="true" size={14} /> Delete</Button>}
      </div>
    </article>
  );
}
