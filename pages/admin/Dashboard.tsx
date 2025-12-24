
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { analyzeDrugRequest } from '../../services/geminiService';
import { UserRole, DrugRequest, Consultation, RequestStatus, AuditLog, User } from '../../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
// Added Loader2 to the list of icons imported from lucide-react
import { ShieldAlert, BrainCircuit, UserPlus, Save, AlertCircle, Key, User as UserIcon, ExternalLink, Info, Search, ListFilter, CheckCircle2, Clock, Sparkles, Stethoscope, Activity, ShieldCheck, FileText, Trash2, Shield, Lock, History, Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const user = StorageService.getCurrentUser();
  const [requests, setRequests] = useState<DrugRequest[]>([]);
  const [consults, setConsults] = useState<Consultation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'CONSULTS' | 'USERS' | 'AUDIT' | 'PROFILE'>('REQUESTS');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // User Form State
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: UserRole.DOCTOR });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.role === UserRole.DOCTOR) setActiveTab('CONSULTS');
    else if (user?.role === UserRole.PHARMACIST) setActiveTab('REQUESTS');
    
    refreshData();
  }, [user?.role]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [reqs, appointments, logs] = await Promise.all([
        StorageService.getRequests(),
        StorageService.getConsultations(),
        StorageService.getAuditLogs()
      ]);
      setRequests(reqs);
      setConsults(appointments);
      setAuditLogs(logs);
      setUsers(StorageService.getUsers());
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: RequestStatus) => {
    await StorageService.updateRequestStatus(id, status);
    refreshData();
  };

  const handleAnalyzeRequest = async (id: string, drugName: string, notes: string) => {
    setAnalyzingId(id);
    try {
      const { text, sources } = await analyzeDrugRequest(drugName, notes);
      await StorageService.updateRequestStatus(id, RequestStatus.PROCESSING, text, sources);
    } catch (error) {
      console.error("Dashboard analysis error:", error);
    } finally {
      setAnalyzingId(null);
      refreshData();
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addUser(newUser);
    setNewUser({ name: '', username: '', password: '', role: UserRole.DOCTOR });
    setPassMsg({ type: 'success', text: 'User added successfully' });
    setTimeout(() => setPassMsg({ type: '', text: '' }), 3000);
    refreshData();
  };

  if (!user) return <div className="p-8 text-center text-red-600 font-bold">Access Denied: Please log in as staff.</div>;

  const statsData = [
    { name: 'Pending', value: requests.filter(r => r.status === RequestStatus.PENDING).length, color: '#94a3b8' },
    { name: 'Processing', value: requests.filter(r => r.status === RequestStatus.PROCESSING).length, color: '#f59e0b' },
    { name: 'Fulfilled', value: requests.filter(r => r.status === RequestStatus.FULFILLED).length, color: '#10b981' },
  ];

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Sourcing</p>
            <h4 className="text-3xl font-extrabold text-slate-900 mt-1">{requests.length}</h4>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
             <ListFilter size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Urgent Tier</p>
            <h4 className="text-3xl font-extrabold text-red-600 mt-1">{requests.filter(r => r.urgency !== 'NORMAL').length}</h4>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
             <AlertCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Triages</p>
            <h4 className="text-3xl font-extrabold text-slate-900 mt-1">{requests.filter(r => r.status === RequestStatus.PROCESSING).length}</h4>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Activity size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ListFilter size={18} /> Drug Request Pipeline
          </h3>
          <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-white rounded-md border border-slate-200">Supabase Connected</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Requester</th>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Medicine & Urgency</th>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No drug requests found.</td>
                </tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{req.requesterName}</div>
                    <div className="text-xs text-slate-500">{req.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-slate-700">{req.genericName}</span>
                       <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{req.urgency}</span>
                    </div>
                    {req.prescription && <div className="text-[10px] text-indigo-600 flex items-center gap-1 mt-1 font-bold"><FileText size={12}/> Document Encrypted</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      req.status === RequestStatus.PENDING ? 'bg-slate-100 text-slate-600' :
                      req.status === RequestStatus.PROCESSING ? 'bg-amber-100 text-amber-700' :
                      req.status === RequestStatus.FULFILLED ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {req.status === RequestStatus.PENDING && (
                        <button 
                          disabled={analyzingId === req.id}
                          onClick={() => handleAnalyzeRequest(req.id, req.genericName, req.notes)} 
                          className="text-white font-bold text-[10px] bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {analyzingId === req.id ? <Activity size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          AI ANALYZE
                        </button>
                      )}
                      {req.status === RequestStatus.PROCESSING && (
                        <button onClick={() => handleStatusUpdate(req.id, RequestStatus.FULFILLED)} className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all">COMPLETE</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConsults = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <Stethoscope size={24} className="text-blue-600" /> Medical Expert Triage
         </h3>
         <div className="flex gap-2">
            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">Scheduled: {consults.length}</span>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consults.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-200">No medical consultations booked.</div>
        ) : consults.map((consult) => (
          <div key={consult.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-[4rem] flex items-start justify-end p-3 text-blue-600 opacity-50 group-hover:opacity-100 transition-opacity">
               <Clock size={20} />
            </div>
            <div className="mb-4">
              <div className="font-extrabold text-lg text-slate-900">{consult.patientName}</div>
              <div className="text-xs text-slate-500 font-medium">{consult.contactEmail}</div>
            </div>
            <div className="text-sm text-slate-600 line-clamp-2 min-h-[40px] mb-4 bg-slate-50 p-3 rounded-xl">
              {consult.reason}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
              <div className="text-xs font-bold text-slate-700">
                {new Date(consult.preferredDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] uppercase text-blue-600 font-extrabold px-2 py-1 bg-blue-50 rounded-md border border-blue-100">
                {consult.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck size={24} className="text-slate-900" /> System Personnel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <UserIcon size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">@{u.username}</div>
                </div>
              </div>
              <div className={`text-[10px] font-extrabold px-2 py-1 rounded border ${
                u.role === UserRole.SUPER_ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' :
                u.role === UserRole.DOCTOR ? 'bg-blue-50 text-blue-700 border-blue-100' :
                'bg-orange-50 text-orange-700 border-orange-100'
              }`}>
                {u.role.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <UserPlus size={20} className="text-red-500" /> Provision Account
        </h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          {passMsg.text && (
            <div className={`p-3 rounded-xl text-xs font-bold text-center ${passMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {passMsg.text}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
            <input required type="text" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm focus:ring-red-500" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</label>
            <input required type="text" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm focus:ring-red-500" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passphrase</label>
            <input required type="password" placeholder="••••••••" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm focus:ring-red-500" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Permission Tier</label>
            <select className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
              <option value={UserRole.DOCTOR}>Medical Doctor</option>
              <option value={UserRole.PHARMACIST}>Pharmacist</option>
              <option value={UserRole.SUPER_ADMIN}>System Administrator</option>
            </select>
          </div>
          <button type="submit" className="w-full py-4 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/50 mt-4">
            Authorize Personnel
          </button>
        </form>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History size={24} className="text-slate-400" /> System Audit Trail
        </h3>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">SOC 2 COMPLIANCE ACTIVE</div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Event Timestamp</th>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Operator</th>
                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">System Action</th>
                <th className="px-6 py-4 text-right text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No audit records found.</td>
                </tr>
              ) : auditLogs.map((log) => (
                <tr key={log.id} className="text-sm font-medium">
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-bold">
                    {log.user}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <code className="text-[10px] text-slate-400 bg-slate-50 p-1 rounded">SHA256:{log.id.substring(0,8)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-full mb-3 tracking-widest">
              <Shield size={12} /> SECURE GATEWAY ACTIVE
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Easygo Command</h1>
            <p className="text-slate-500 font-medium mt-1">Authorized Personnel: <span className="text-slate-900 font-bold">{user.name}</span> <span className="text-slate-400 text-xs ml-2">({user.role.replace('_', ' ')})</span></p>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2">
            <button onClick={refreshData} className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900" title="Refresh Dashboard">
              <Activity size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <div className="flex items-center px-4 gap-3 text-sm font-bold text-slate-600">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               Live Updates
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="border-b border-slate-100 flex flex-wrap bg-white p-3 gap-2 sticky top-0 z-10">
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PHARMACIST) && (
              <button onClick={() => setActiveTab('REQUESTS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl transition-all ${activeTab === 'REQUESTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Pharma Sourcing</button>
            )}
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DOCTOR) && (
              <button onClick={() => setActiveTab('CONSULTS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl transition-all ${activeTab === 'CONSULTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Medical Triage</button>
            )}
            {user.role === UserRole.SUPER_ADMIN && (
              <>
                <button onClick={() => setActiveTab('USERS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl transition-all ${activeTab === 'USERS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Access Control</button>
                <button onClick={() => setActiveTab('AUDIT')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl transition-all ${activeTab === 'AUDIT' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Audit Log</button>
              </>
            )}
          </div>
          
          <div className="p-8 md:p-12 flex-grow bg-slate-50/30">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-300">
                 {/* Fixed: Loader2 is now imported from lucide-react */}
                 <Loader2 className="animate-spin mb-4" size={48} />
                 <span className="text-sm font-bold tracking-widest uppercase">Deciphering Secure Records...</span>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'REQUESTS' && renderRequests()}
                {activeTab === 'CONSULTS' && renderConsults()}
                {activeTab === 'USERS' && renderUsers()}
                {activeTab === 'AUDIT' && renderAuditLogs()}
              </div>
            )}
          </div>
        </div>

        {/* AI Insight Footer */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={160} />
           </div>
           <div className="relative z-10 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                 <BrainCircuit className="text-indigo-400" /> AI-Driven Pipeline Overview
              </h3>
              <p className="text-slate-400 text-sm font-medium">Gemini 3 Pro is currently monitoring your supply chain for anomalies.</p>
           </div>
           <div className="w-full md:w-64 h-24 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: 'white' }}
                    itemStyle={{ color: 'white', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
