
import React from 'react';
import { AuditLog } from '../../types';
import { History } from 'lucide-react';

interface AuditTabProps {
  auditLogs: AuditLog[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2"><History className="text-slate-400" /> Immutable Audit Trail</h3>
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase">Timestamp</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase">Operator</th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {auditLogs.map(l => (
              <tr key={l.id} className="text-sm font-medium">
                <td className="px-6 py-4 text-slate-500">{new Date(l.timestamp).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })} WAT</td>
                <td className="px-6 py-4 font-bold">{l.user}</td>
                <td className="px-6 py-4 text-slate-700 bg-slate-50/50">{l.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
