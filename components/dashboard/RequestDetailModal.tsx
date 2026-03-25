
import React from 'react';
import { X, ExternalLink, Activity, MapPin, Mail, Phone, Clock, FileText, BrainCircuit, Sparkles, Pill } from 'lucide-react';
import { DrugRequest, UserRole, User } from '../../types';

interface RequestDetailModalProps {
  request: DrugRequest | null;
  user: User;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, user, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                request.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                request.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {request.status}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">{request.id.split('-')[0]}...</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Request Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-8">
          
          {/* Requester Identity */}
          <section>
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserRoleIcon role={user.role} /> Requester Profile
            </h3>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-bold text-slate-900">{request.requesterName}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{request.requesterType}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5 justify-end">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(request.createdAt).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(request.createdAt).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', timeStyle: 'short' })} WAT
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <a href={`mailto:${request.contactEmail}`} className="hover:text-blue-600 transition-colors truncate">{request.contactEmail}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <a href={`tel:${request.contactPhone}`} className="hover:text-blue-600 transition-colors truncate">{request.contactPhone}</a>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600 font-medium md:col-span-2">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{request.address}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Medications Requested */}
          <section>
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} /> Clinical Requirements
            </h3>
            <div className="space-y-3">
              {(request.drugs && request.drugs.length > 0) ? (
                request.drugs.map((d, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${d.urgency === 'CRITICAL' ? 'bg-red-500' : d.urgency === 'HIGH' ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Pill size={16} className="text-slate-400 -rotate-45" />
                          <h4 className="text-lg font-bold text-slate-900">{d.genericName}</h4>
                        </div>
                        {d.brandName && <div className="text-sm font-medium text-slate-500 mb-2">Preferred Brand: {d.brandName}</div>}
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg inline-flex">
                          <span>{d.dosageStrength}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>Qty: {d.quantity}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-widest ${d.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : d.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {d.urgency}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${request.urgency === 'CRITICAL' ? 'bg-red-500' : request.urgency === 'HIGH' ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Pill size={16} className="text-slate-400 -rotate-45" />
                          <h4 className="text-lg font-bold text-slate-900">{request.genericName}</h4>
                        </div>
                        {request.brandName && <div className="text-sm font-medium text-slate-500 mb-2">Preferred Brand: {request.brandName}</div>}
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg inline-flex">
                          <span>{request.dosageStrength}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>Qty: {request.quantity}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-widest ${request.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : request.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {request.urgency}
                      </span>
                    </div>
                </div>
              )}
            </div>
            
            {request.notes && (
              <div className="mt-4 bg-yellow-50/50 rounded-2xl p-5 border border-yellow-100/50">
                <h4 className="text-[10px] font-extrabold text-yellow-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText size={12} /> Clinical Notes & Context
                </h4>
                <p className="text-sm font-medium text-yellow-900 leading-relaxed italic border-l-2 border-yellow-200 pl-3">"{request.notes}"</p>
              </div>
            )}
            
            {request.prescription && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <a href={request.prescription.data} download={request.prescription.fileName} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md">
                  <FileText size={16} /> Download Prescription File
                </a>
                <div className="text-xs text-slate-400 mt-2 font-medium">Encrypted format: {request.prescription.fileName}</div>
              </div>
            )}
          </section>

          {/* AI Assessment Result */}
          {request.aiAnalysis && (
            <section>
              <h3 className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BrainCircuit size={14} /> Gemini Medical Intelligence
              </h3>
              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 font-black mb-3 text-indigo-800 uppercase tracking-wider text-xs">
                  <Sparkles size={14} className="text-indigo-500" /> Automated Sourcing Audit
                </div>
                <div className="prose prose-sm prose-indigo font-medium text-slate-700 max-w-none">
                  {request.aiAnalysis.split('\n').map((paragraph, idx) => (
                     <p key={idx} className="mb-2 last:mb-0">{paragraph}</p>
                  ))}
                </div>
                
                {request.aiSources && request.aiSources.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-indigo-200/50">
                    <h4 className="text-[10px] font-extrabold text-indigo-800/60 uppercase tracking-widest mb-3">Verified Literature Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {request.aiSources.map((s, idx) => (
                        <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 shadow-sm rounded-lg hover:bg-indigo-50 transition-colors font-bold text-xs text-indigo-700">
                          <ExternalLink size={12} /> <span className="truncate max-w-[200px]">{s.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
        
        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-4 bg-white mt-auto shrink-0 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

const UserRoleIcon = ({ role }: { role: string }) => {
  return <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>;
};
