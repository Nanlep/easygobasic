
import React, { useState } from 'react';
import { Consultation, ConsultStatus, UserRole, User } from '../../types';
import { SearchFilter } from './SearchFilter';
import { StorageService } from '../../services/storageService';
import { useToast } from '../Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, FileSearch } from 'lucide-react';

interface ConsultationsTabProps {
  consults: Consultation[];
  user: User;
  onRefresh: () => void;
  getStatusColorClasses: (status: ConsultStatus) => string;
}

export const ConsultationsTab: React.FC<ConsultationsTabProps> = ({ consults, user, onRefresh, getStatusColorClasses }) => {
  const { showToast } = useToast();
  const [filters, setFilters] = useState({ search: '', status: 'ALL', urgency: 'ALL' });

  const handleStatusUpdate = async (id: string, status: ConsultStatus) => {
    try {
      await StorageService.updateConsultStatus(id, status);
      onRefresh();
      showToast(`Status updated to ${status}`, 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleLockToggle = async (id: string, currentState: boolean) => {
    try {
      await StorageService.toggleConsultLock(id, !currentState);
      onRefresh();
      showToast(`Record ${!currentState ? 'locked' : 'unlocked'}`, 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const filtered = consults.filter(c => {
    if (filters.status !== 'ALL' && c.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesName = c.patientName?.toLowerCase().includes(q);
      const matchesReason = c.reason?.toLowerCase().includes(q);
      if (!matchesName && !matchesReason) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <SearchFilter
        onFilterChange={setFilters}
        statusOptions={Object.values(ConsultStatus)}
        placeholder="Search by patient name or reason..."
      />

      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {filtered.length} of {consults.length} consultations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="col-span-full text-center py-12 text-sm text-slate-400 font-medium"
            >
              No consultations match your filters.
            </motion.div>
          ) : filtered.map((c) => (
            <motion.div 
              key={c.id} 
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`bg-white p-6 rounded-2xl border ${!!c.isLocked ? 'border-red-100' : 'border-slate-200'} shadow-sm relative group hover:shadow-md transition-shadow`}
            >
              <div className="absolute top-2 right-2 flex gap-2">
                {user.role === UserRole.SUPER_ADMIN && (
                  <button onClick={() => handleLockToggle(c.id, !!c.isLocked)} title={!!c.isLocked ? "Unlock" : "Lock"} className={`p-1.5 rounded-lg ${!!c.isLocked ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-400'}`}>
                    {!!c.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                )}
              </div>
              <div className="mb-4">
                <div className="font-extrabold text-lg text-slate-900">{c.patientName}</div>
                <div className="text-xs text-slate-500">{new Date(c.preferredDate).toLocaleString()}</div>
                {c.address && <div className="text-xs text-slate-400 mt-0.5">📍 {c.address}</div>}
                <div className="text-[10px] text-slate-400 mt-1">🕐 Submitted: {new Date(c.createdAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })} WAT</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 mb-4 line-clamp-2 italic">"{c.reason}"</div>
            <div className="flex flex-col gap-3">
              {c.attachment && (
                <a href={c.attachment.data} download={c.attachment.fileName} className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                  <FileSearch size={14} /> Patient Document
                </a>
              )}
              <select
                value={c.status}
                disabled={!!c.isLocked && user.role !== UserRole.SUPER_ADMIN}
                onChange={(e) => handleStatusUpdate(c.id, e.target.value as ConsultStatus)}
                className={`w-full text-xs font-bold p-2 rounded-xl border transition-colors ${!!c.isLocked ? 'bg-slate-50 cursor-not-allowed' : getStatusColorClasses(c.status)}`}
              >
                {Object.values(ConsultStatus).map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
              </select>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
