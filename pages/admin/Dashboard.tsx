
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { analyzeDrugRequest } from '../../services/geminiService';
import { UserRole, DrugRequest, Consultation, RequestStatus, AuditLog, User } from '../../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldAlert, BrainCircuit, UserPlus, Save, AlertCircle, Key, User as UserIcon, ExternalLink, Info, Search, ListFilter, CheckCircle2, Clock, Sparkles, Stethoscope, Activity, ShieldCheck, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const user = StorageService.getCurrentUser();
  const [requests, setRequests] = useState<DrugRequest[]>([]);
  const [consults, setConsults] = useState<Consultation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'CONSULTS' | 'USERS' | 'AUDIT' | 'PROFILE'>('REQUESTS');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // User Form State
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: UserRole.DOCTOR });
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setRequests(StorageService.getRequests());
    setConsults(StorageService.getConsultations());
    setAuditLogs(StorageService.getAuditLogs());
    setUsers(StorageService.getUsers());
  };

  const handleStatusUpdate = (id: string, status: RequestStatus) => {
    StorageService.updateRequestStatus(id, status);
    refreshData();
  };

  const handleAnalyzeRequest = async (id: string, drugName: string, notes: string) => {
    setAnalyzingId(id);
    try {
      const { text, sources } = await analyzeDrugRequest(drugName, notes);
      StorageService.updateRequestStatus(id, RequestStatus.PROCESSING, text, sources);
    } catch (error) {
      console.error("Dashboard analysis error:", error);
    } finally {
      setAnalyzingId(null);
      refreshData();
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');
    
    try {
      if (!newUser.name || !newUser.username || !newUser.password) {
        throw new Error("All fields are required");
      }
      StorageService.addUser(newUser);
      setUserFormSuccess(`User ${newUser.username} created successfully.`);
      setNewUser({ name: '', username: '', password: '', role: UserRole.DOCTOR });
      refreshData();
    } catch (err: any) {
      setUserFormError(err.message || "Failed to create user");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPassMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (user) {
      StorageService.updatePassword(user.username, passwordForm.new);
      setPassMsg({ type: 'success', text: 'Password updated successfully.' });
      setPasswordForm({ new: '', confirm: '' });
    }
  };

  if (!user) return <div className="p-8 text-center text-red-600 font-bold">Access Denied: Please log in as staff.</div>;

  const statsData = [
    { name: 'Pending', value: requests.filter(r => r.status === RequestStatus.PENDING).length },
    { name: 'Active', value: requests.filter(r => r.status === RequestStatus.PROCESSING).length },
    { name: 'Done', value: requests.filter(r => r.status === RequestStatus.FULFILLED).length },
  ];

  const Loader2 = ({className, size}: {className?: string, size?: number}) => <Activity className={className} size={size} />;

  const renderRequests = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ListFilter size={18} /> Drug Request Pipeline
          </h3>
          <span className="text-xs text-slate-500 font-medium">Real-time Synchronization Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Triage</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{req.requesterName}</div>
                    <div className="text-xs text-slate-500">{req.requesterType} • {req.contactEmail}</div>
                    <div className="text-xs text-slate-400">{req.contactPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{req.genericName}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{req.notes}</div>
                    {req.prescription && (
                      <a href={req.prescription.data} download={req.prescription.fileName} className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1 hover:underline">
                        <FileText size={12} /> Prescription: {req.prescription.fileName}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                      req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' : req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       {req.status === RequestStatus.PENDING ? <Clock size={14} className="text-slate-400" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                       <span className="text-sm font-medium text-slate-600 uppercase tracking-tight">{req.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold space-x-3">
                    {req.status === RequestStatus.PENDING && (
                      <button 
                        onClick={() => handleAnalyzeRequest(req.id, req.genericName, req.notes)}
                        disabled={analyzingId === req.id}
                        className="text-purple-700 hover:text-purple-900 inline-flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 transition-all active:scale-95"
                      >
                       {analyzingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                       {analyzingId === req.id ? 'Sourcing...' : 'AI Sourcing'}
                      </button>
                    )}
                    {req.status === RequestStatus.PROCESSING && (
                      <button 
                        onClick={() => handleStatusUpdate(req.id, RequestStatus.FULFILLED)} 
                        className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
                      >
                        Fulfill Request
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sourcing Intelligence Deep Dive */}
      <div className="grid gap-6">
        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 ml-2">
          <Sparkles className="text-purple-600" size={20} /> Advanced Supply Chain Intelligence
        </h4>
        {requests.filter(r => r.aiAnalysis).map(req => (
           <div key={`analysis-${req.id}`} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <BrainCircuit size={120} />
              </div>
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                   <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
                    <Search className="text-white" size={24} />
                   </div>
                   <div>
                     <h4 className="font-extrabold text-xl text-slate-900">{req.genericName}</h4>
                     <p className="text-xs text-purple-600 uppercase tracking-widest font-extrabold">Gemini 3 Grounded Report</p>
                   </div>
                </div>
                <div className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 font-bold border border-slate-200">
                   Sourcing ID: {req.id.slice(-8)}
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-8 whitespace-pre-line text-sm bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                {req.aiAnalysis}
              </div>

              {req.aiSources && req.aiSources.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ExternalLink size={14} /> Verified Grounding References
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    {req.aiSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold transition-all hover:border-purple-300 hover:-translate-y-0.5"
                      >
                        <span className="truncate max-w-[200px]">{source.title}</span>
                        <ExternalLink size={12} className="text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
           </div>
        ))}
      </div>
    </div>
  );

  const renderConsults = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Stethoscope className="text-blue-600" /> Medical Expert Triage
      </h3>
      <div className="grid gap-4">
        {consults.map((consult) => (
          <div key={consult.id} className="border p-6 rounded-2xl hover:bg-slate-50/50 transition border-slate-200 bg-slate-50/30">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-100 shrink-0">
                  {consult.patientName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{consult.patientName}</h4>
                  <p className="text-sm text-slate-500 font-medium">{consult.contactEmail} • {consult.contactPhone}</p>
                  
                  <div className="mt-3 space-y-3">
                    <div className="text-sm text-slate-700 bg-white border border-slate-200 p-4 rounded-xl max-w-xl shadow-sm">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Patient Inquiry</span>
                      {consult.reason}
                    </div>

                    {consult.attachment && (
                      <a 
                        href={consult.attachment.data} 
                        download={consult.attachment.fileName}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <FileText size={14} /> Supporting File: {consult.attachment.fileName}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right w-full md:w-auto">
                <div className="text-sm font-bold text-slate-900 mb-1">{new Date(consult.preferredDate).toLocaleDateString()}</div>
                <div className="text-xs text-slate-500 font-bold mb-3">{new Date(consult.preferredDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${
                  consult.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {consult.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {consults.length === 0 && <div className="text-slate-400 text-center py-20 italic font-medium">No consultations scheduled in this jurisdiction.</div>}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <UserPlus size={24} className="text-slate-900" /> System Provisioning
        </h3>
        <form onSubmit={handleAddUser} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Legal Identity</label>
            <input required type="text" className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-slate-900 focus:border-slate-900 p-3 border font-medium" placeholder="Full Professional Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Auth Identifier</label>
               <input required type="text" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})}/>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Credentials</label>
               <input required type="password" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Clearance Tier</label>
            <select className="w-full rounded-xl border-slate-200 p-3 border font-bold text-slate-700" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
              <option value={UserRole.DOCTOR}>Medical Consultant</option>
              <option value={UserRole.PHARMACIST}>Sourcing Specialist</option>
              <option value={UserRole.SUPER_ADMIN}>Platform Governance</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            Authorize New User
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold mb-6">Staff Registry</h3>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {users.map((u) => (
            <div key={u.username} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm font-bold">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-400 font-mono">ID: {u.id.slice(0,6)}</div>
                </div>
              </div>
              <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-widest ${
                u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                u.role === UserRole.DOCTOR ? 'bg-blue-100 text-blue-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {u.role.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudit = () => (
     <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <ShieldAlert className="text-red-700" size={24} />
          ISO 27001 Immutable Log
        </h3>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Monitoring Active</span>
        </div>
      </div>
      <div className="overflow-hidden bg-slate-900 rounded-2xl text-[11px] font-mono text-emerald-400/90 p-6 h-[500px] overflow-y-auto shadow-inner">
        {auditLogs.map(log => (
          <div key={log.id} className="mb-3 border-b border-slate-800/50 pb-3 flex gap-4 hover:bg-slate-800/30 transition-colors p-1 rounded">
            <span className="text-slate-500 shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className="text-yellow-500/80 font-bold shrink-0">[{log.user.toUpperCase()}]</span>
            <span className="text-white/90">{log.action}</span>
            <span className="ml-auto text-slate-700 text-[9px]">{log.id}</span>
          </div>
        ))}
      </div>
     </div>
  );

  const renderProfile = () => (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-lg border border-slate-200">
      <div className="text-center mb-10">
         <div className="w-24 h-24 bg-slate-900 text-white rounded-3xl mx-auto flex items-center justify-center text-3xl font-bold mb-4 shadow-xl">
           {user.name.charAt(0)}
         </div>
         <h2 className="text-2xl font-extrabold text-slate-900">{user.name}</h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{user.role.replace('_', ' ')} CLEARANCE</p>
      </div>

      <div className="mb-10 p-6 bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl">
        <div className="flex items-center gap-3 mb-3 font-bold text-amber-900">
          <ShieldAlert size={20} /> SOC 2 Password Compliance
        </div>
        <ul className="list-disc list-inside space-y-2 text-xs text-amber-800 font-medium">
          <li>System requires 12+ character mixed-entropy strings.</li>
          <li>Credentials expire automatically every 90 calendar days.</li>
          <li>Previous 5 passwords cannot be reused.</li>
        </ul>
      </div>
      
      <form onSubmit={handleChangePassword} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-2">New Password</label>
            <input required type="password" placeholder="••••••••••••" className="w-full rounded-xl border-slate-200 p-4 border font-medium focus:ring-slate-900" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}/>
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-2">Verify New Password</label>
            <input required type="password" placeholder="••••••••••••" className="w-full rounded-xl border-slate-200 p-4 border font-medium focus:ring-slate-900" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}/>
          </div>
        </div>

        {passMsg.text && (
          <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <AlertCircle size={18} /> {passMsg.text}
          </div>
        )}

        <button type="submit" className="w-full py-4 bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95">
          Rotate Credentials
        </button>
      </form>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-widest">Internal Portal</span>
               <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">Restricted</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Command</h1>
            <p className="text-slate-500 font-medium mt-1">Managing global logistics, PHI, and expert consultations.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                 <ShieldCheck size={24} className="text-slate-900" />
               </div>
               <div>
                 <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Compliance Status</div>
                 <div className="text-sm font-bold text-slate-900">SOC 2 Type II Verified</div>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest mb-2">Active Pipeline</div>
            <div className="text-4xl font-extrabold text-slate-900">{requests.length}</div>
            <div className="text-xs text-red-600 mt-2 font-bold flex items-center gap-1">
               <Activity size={12} /> Global Sourcing Operations
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest mb-2">Expert Sessions</div>
            <div className="text-4xl font-extrabold text-blue-600">{consults.length}</div>
            <div className="text-xs text-blue-500 mt-2 font-bold flex items-center gap-1">
               <Clock size={12} /> Pending Triage
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
             <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest mb-2">Personnel Clearances</div>
             <div className="text-4xl font-extrabold text-emerald-600">{users.length}</div>
             <div className="text-xs text-emerald-500 mt-2 font-bold flex items-center gap-1">
               <ShieldCheck size={12} /> Authorized Access
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center">
             <ResponsiveContainer width="100%" height={100}>
               <BarChart data={statsData}>
                 <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden min-h-[700px]">
          <div className="border-b border-slate-200 flex flex-wrap bg-slate-50/50 p-2 gap-2">
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PHARMACIST) && (
              <button 
                onClick={() => setActiveTab('REQUESTS')}
                className={`px-8 py-4 text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'REQUESTS' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Pharma Sourcing
              </button>
            )}
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DOCTOR) && (
              <button 
                onClick={() => setActiveTab('CONSULTS')}
                className={`px-8 py-4 text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'CONSULTS' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Medical Triage
              </button>
            )}
            {user.role === UserRole.SUPER_ADMIN && (
              <button 
                onClick={() => setActiveTab('USERS')}
                className={`px-8 py-4 text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'USERS' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Access Control
              </button>
            )}
            {user.role === UserRole.SUPER_ADMIN && (
              <button 
                onClick={() => setActiveTab('AUDIT')}
                className={`px-8 py-4 text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'AUDIT' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Governance Log
              </button>
            )}
            <button 
              onClick={() => setActiveTab('PROFILE')}
              className={`px-8 py-4 text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all ml-auto flex items-center gap-2 ${activeTab === 'PROFILE' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <UserIcon size={14} /> My Profile
            </button>
          </div>
          
          <div className="p-10">
            {activeTab === 'REQUESTS' && renderRequests()}
            {activeTab === 'CONSULTS' && renderConsults()}
            {activeTab === 'USERS' && renderUsers()}
            {activeTab === 'AUDIT' && renderAudit()}
            {activeTab === 'PROFILE' && renderProfile()}
          </div>
        </div>
      </div>
    </div>
  );
};
