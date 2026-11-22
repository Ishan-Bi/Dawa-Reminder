import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Patient } from '@/types';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { isLocalOnlyPatientUrl, patientAccessUrl } from '@/lib/patientAccess';

interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export function ShareQrModal({ isOpen, onClose, patient }: ShareQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!patient) return null;

  const patientUrl = patientAccessUrl(patient.access_token);
  // Generate QR code SVG using free fast QR code API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    patientUrl
  )}&color=16-124-83`;

  const handleCopy = () => {
    navigator.clipboard.writeText(patientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Access Link for ${patient.name}`}>
      <div className="text-center space-y-6">
        {isLocalOnlyPatientUrl() && <p role="note" className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left text-sm leading-6 text-amber-900">This link currently points to localhost, so it will only open on this computer. For a patient&apos;s phone, open DawaReminder using the computer&apos;s network address (for example, <strong>http://192.168.1.25:3000</strong>) and create/share the link again.</p>}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Open this link on <span className="font-bold text-gray-900">{patient.name}&apos;s</span> phone or scan the QR code.
          </p>
          <p className="text-xs text-[#167C53] font-semibold bg-[#E9F5EF] py-1.5 px-3 rounded-full inline-block">
            ✨ No password or login required for elderly patients!
          </p>
        </div>

        {/* QR Code Frame */}
        <div className="bg-[#F8FAF9] p-6 rounded-3xl border-2 border-dashed border-[#167C53]/30 inline-block shadow-xs">
          <img
            src={qrImageUrl}
            alt={`QR code for ${patient.name}`}
            className="w-48 h-48 mx-auto rounded-xl"
          />
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={patientUrl}
              className="w-full bg-gray-50 border text-xs font-mono rounded-xl p-3 select-all"
            />
            <Button size="sm" onClick={handleCopy} variant={copied ? 'secondary' : 'primary'}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <a
            href={patientUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#167C53] hover:underline"
          >
            <ExternalLink className="w-4 h-4" /> Open Live Patient View
          </a>
        </div>
      </div>
    </Modal>
  );
}
