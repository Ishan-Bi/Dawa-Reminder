import { useState, useEffect } from 'react';
import { Patient, Dose } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { History, Pill, Calendar, Filter } from 'lucide-react';

interface HistoryViewProps {
  patient: Patient | null;
}

export function HistoryView({ patient }: HistoryViewProps) {
  const [history, setHistory] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!patient) return;
    setLoading(true);
    apiRequest<Dose[]>(`/patients/${patient.id}/history`)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [patient?.id]);

  if (!patient) {
    return <p className="text-gray-500">Please select a patient.</p>;
  }

  const filtered = statusFilter === 'all' ? history : history.filter((d) => d.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#202824] flex items-center gap-2">
            <History className="w-6 h-6 text-[#167C53]" /> Dose History & Audit Log
          </h2>
          <p className="text-sm text-gray-500">
            Complete record of taken, skipped, and missed medications for <span className="font-semibold">{patient.name}</span>
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border text-xs font-semibold rounded-xl px-3 py-2 text-gray-700"
          >
            <option value="all">All Statuses ({history.length})</option>
            <option value="taken">Taken</option>
            <option value="pending">Pending</option>
            <option value="skipped">Skipped</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading history logs...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-2">
          <p className="text-gray-500 font-medium">No dose events recorded yet.</p>
          <p className="text-xs text-gray-400">Events appear as doses are acted upon by the patient or caregiver.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAF9] border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Scheduled Time</th>
                  <th className="px-6 py-4">Medication</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Recorded At</th>
                  <th className="px-6 py-4">Acted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((dose) => {
                  const scheduledDt = new Date(dose.scheduled_at);
                  const actedDt = dose.acted_at ? new Date(dose.acted_at) : null;

                  return (
                    <tr key={dose.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {scheduledDt.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            ,{' '}
                            {scheduledDt.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-[#167C53]" />
                          <span>{dose.medication_name}</span>
                          {dose.medication_strength && (
                            <span className="text-xs font-normal text-gray-500">
                              ({dose.medication_strength})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={dose.status}>
                          {dose.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {actedDt
                          ? `${actedDt.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}`
                          : '—'}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-gray-600 capitalize">
                        {dose.acted_by || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
