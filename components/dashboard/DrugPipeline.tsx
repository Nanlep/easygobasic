
import React, { useState } from 'react';
import { DrugRequest, RequestStatus, UserRole, User } from '../../types';
import { SearchFilter } from './SearchFilter';
import { analyzeDrugRequest } from '../../services/geminiService';
import { StorageService } from '../../services/storageService';
import { useToast } from '../Toast';
import { RequestDetailModal } from './RequestDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, ExternalLink, ListFilter, Sparkles, FileText,
  Lock, Unlock, Loader2, Maximize2
} from 'lucide-react';

interface DrugPipelineProps {
  requests: DrugRequest[];
  user: User;
  onRefresh: () => void;
  getStatusColorClasses: (status: RequestStatus) => string;
}

export const DrugPipeline: React.FC<DrugPipelineProps> = ({ requests, user, onRefresh, getStatusColorClasses }) => {
  const { showToast } = useToast();
  const [isAuditing, setIsAuditing] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', urgency: 'ALL' });
  const [selectedRequest, setSelectedRequest] = useState<DrugRequest | null>(null);

  const handleStatusUpdate = async (id: string, status: RequestStatus) => {
    try {
      await StorageService.updateRequestStatus(id, status);
      onRefresh();
      showToast(`Status updated to ${status}`, 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleAIAudit = async (req: DrugRequest) => {
    setIsAuditing(req.id);
    try {
      const { text, sources } = await analyzeDrugRequest(req.genericName, req.notes);
      await StorageService.updateRequestStatus(req.id, req.status, text, sources);
      onRefresh();
      showToast("AI Audit completed successfully", 'success');
    } catch (err: any) {
      showToast("AI Audit failed: " + err.message, 'error');
    } finally {
      setIsAuditing(null);
    }
  };

  const handleLockToggle = async (id: string, currentState: boolean) => {
    try {
      await StorageService.toggleRequestLock(id, !currentState);
      onRefresh();
      showToast(`Record ${!currentState ? 'locked' : 'unlocked'}`, 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  // Apply filters
  const filtered = requests.filter(req => {
    if (filters.status !== 'ALL' && req.status !== filters.status) return false;
    if (filters.urgency !== 'ALL') {
      const matchesUrgency = req.drugs?.some(d => d.urgency === filters.urgency) || req.urgency === filters.urgency;
      if (!matchesUrgency) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesName = req.requesterName?.toLowerCase().includes(q);
      const matchesEmail = req.contactEmail?.toLowerCase().includes(q);
      const matchesDrug = req.genericName?.toLowerCase().includes(q) || req.drugs?.some(d => d.genericName?.toLowerCase().includes(q));
      if (!matchesName && !matchesEmail && !matchesDrug) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <SearchFilter
        onFilterChange={setFilters}
        statusOptions={Object.values(RequestStatus)}
        showUrgency={true}
        placeholder="Search by name, email, or drug..."
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><ListFilter size={18} /> Drug Requests</h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1 bg-white border border-slate-200 rounded">
            {filtered.length} of {requests.length} results
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Requester</th>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Medicine</th>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Documents</th>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">No requests match your filters.</td>
                  </motion.tr>
                ) : filtered.map((req) => (
                  <motion.tr 
                    key={req.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedRequest(req)}>
                    <div className="flex items-center gap-2">
                       <div className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">{req.requesterName}</div>
                       <Maximize2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-slate-500">{req.contactEmail}</div>
                    {req.address && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">📍 {req.address}</div>}
                    <div className="text-[10px] text-slate-400 mt-1">🕐 {new Date(req.createdAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })} WAT</div>
                    {req.aiAnalysis && (
                      <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 max-w-xs">
                        <div className="flex items-center gap-1 font-black mb-1.5 uppercase tracking-wider">
                          <Sparkles size={10} className="text-indigo-500" /> AI Assessment
                        </div>
                        <p className="line-clamp-4 leading-relaxed mb-2 font-medium">"{req.aiAnalysis}"</p>
                        {req.aiSources && req.aiSources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-indigo-100">
                            {req.aiSources.map((s, idx) => (
                              <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-indigo-200 rounded-full hover:bg-indigo-100 transition-colors font-bold text-[8px]">
                                <ExternalLink size={8} /> {s.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {req.drugs && req.drugs.length > 0 ? (
                      <div className="space-y-2">
                        {req.drugs.length > 1 && (
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">
                            {req.drugs.length} Medications
                          </div>
                        )}
                        {req.drugs.map((d, i) => (
                          <div key={i} className="flex flex-col gap-0.5 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 text-sm">{d.genericName}</span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${d.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>{d.urgency}</span>
                            </div>
                            <span className="text-xs text-slate-500">{d.dosageStrength} • Qty: {d.quantity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 text-sm">{req.genericName}</span>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>{req.urgency}</span>
                        </div>
                        <span className="text-xs text-slate-500">{req.dosageStrength} • Qty: {req.quantity}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {req.prescription ? (
                      <a href={req.prescription.data} download={req.prescription.fileName} className="inline-flex items-center gap-2 text-xs font-bold text-red-700 hover:underline">
                        <FileText size={14} /> View prescription
                      </a>
                    ) : <span className="text-xs text-slate-400">None</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={req.status}
                        disabled={!!req.isLocked && user.role !== UserRole.SUPER_ADMIN}
                        onChange={(e) => handleStatusUpdate(req.id, e.target.value as RequestStatus)}
                        className={`text-xs font-bold p-1 rounded border transition-colors ${!!req.isLocked ? 'bg-slate-50 opacity-50 cursor-not-allowed' : getStatusColorClasses(req.status)}`}
                      >
                        {Object.values(RequestStatus).map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
                      </select>
                      {user.role === UserRole.SUPER_ADMIN && (
                        <button onClick={() => handleLockToggle(req.id, !!req.isLocked)} title={!!req.isLocked ? "Unlock Record" : "Lock Record"} className={`p-1 rounded ${!!req.isLocked ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}>
                          {!!req.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAIAudit(req)}
                      disabled={isAuditing === req.id}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest disabled:opacity-50"
                    >
                      {isAuditing === req.id ? <Loader2 size={10} className="animate-spin" /> : <BrainCircuit size={10} />}
                      AI Audit
                    </button>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailModal 
        request={selectedRequest} 
        user={user} 
        onClose={() => setSelectedRequest(null)} 
      />
    </div>
  );
};
