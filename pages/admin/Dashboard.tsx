
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { analyzeDrugRequest } from '../../services/geminiService';
import { UserRole, DrugRequest, Consultation, RequestStatus, ConsultStatus, AuditLog, User } from '../../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { 
  ShieldAlert, BrainCircuit, UserPlus, Save, AlertCircle, Key, User as UserIcon, 
  ExternalLink, Info, Search, ListFilter, CheckCircle2, Clock, Sparkles, 
  Stethoscope, Activity, ShieldCheck, FileText, Trash2, Shield, Lock, Unlock, 
  History, Loader2, LogOut, Settings, BarChart3, FileSearch
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const user = StorageService.getCurrentUser();
  const [requests, setRequests] = useState<DrugRequest[]>([]);
  const [consults, setConsults] = useState<Consultation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'CONSULTS' | 'USERS' | 'AUDIT' | 'ANALYTICS' | 'SETTINGS'>('REQUESTS');
  
  // User Settings State
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // New Staff State
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: UserRole.DOCTOR });
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    } catch (e) {
      console.error("Dashboard refresh error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestStatusUpdate = async (id: string, status: RequestStatus) => {
    try {
      await StorageService.updateRequestStatus(id, status);
      refreshData();
    } catch (err: any) { alert(err.message); }
  };

  const handleConsultStatusUpdate = async (id: string, status: ConsultStatus) => {
    try {
      await StorageService.updateConsultStatus(id, status);
      refreshData();
    } catch (err: any) { alert(err.message); }
  };

  const handleLockToggle = async (id: string, type: 'REQUEST' | 'CONSULT', currentState: boolean) => {
    try {
      if (type === 'REQUEST') await StorageService.toggleRequestLock(id, !currentState);
      else await StorageService.toggleConsultLock(id, !currentState);
      refreshData();
    } catch (err: any) { 
      // Specific alert if schema migration is missing
      alert(err.message); 
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    try {
      StorageService.updateUserPassword(user!.username, passForm.new);
      setPassMsg({ type: 'success', text: 'Password successfully updated.' });
      setPassForm({ old: '', new: '', confirm: '' });
    } catch (err) { setPassMsg({ type: 'error', text: 'Update failed.' }); }
  };

  const handleDeleteStaff = (id: string) => {
    StorageService.deleteUser(id);
    setDeleteId(null);
    refreshData();
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addUser(newUser);
    setNewUser({ name: '', username: '', password: '', role: UserRole.DOCTOR });
    setPassMsg({ type: 'success', text: 'Staff provisioned successfully' });
    setTimeout(() => setPassMsg({ type: '', text: '' }), 3000);
    refreshData();
  };

  const getStatusColorClasses = (status: RequestStatus | ConsultStatus) => {
    switch (status) {
      case RequestStatus.COMPLETED:
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case RequestStatus.CANCELLED:
        return 'text-red-600 bg-red-50 border-red-100';
      case RequestStatus.PENDING:
        return 'text-slate-400 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-700 bg-white border-slate-200';
    }
  };

  if (!user) return <div className="p-8 text-center text-red-600 font-bold">Access Denied.</div>;

  // --- Analytics Data Helpers ---
  const requestStats = [
    { name: 'Pending', value: requests.filter(r => r.status === RequestStatus.PENDING).length, fill: '#94a3b8' },
    { name: 'Completed', value: requests.filter(r => r.status === RequestStatus.COMPLETED).length, fill: '#10b981' },
    { name: 'Canceled', value: requests.filter(r => r.status === RequestStatus.CANCELLED).length, fill: '#ef4444' },
  ];

  const consultStats = [
    { name: 'Pending', value: consults.filter(c => c.status === ConsultStatus.PENDING).length, fill: '#94a3b8' },
    { name: 'Completed', value: consults.filter(c => c.status === ConsultStatus.COMPLETED).length, fill: '#3b82f6' },
    { name: 'Canceled', value: consults.filter(c => c.status === ConsultStatus.CANCELLED).length, fill: '#f59e0b' },
  ];

  const staffStats = [
    { name: 'Admin', value: users.filter(u => u.role === UserRole.SUPER_ADMIN).length, fill: '#1e293b' },
    { name: 'Doctor', value: users.filter(u => u.role === UserRole.DOCTOR).length, fill: '#3b82f6' },
    { name: 'Pharmacist', value: users.filter(u => u.role === UserRole.PHARMACIST).length, fill: '#f97316' },
  ];

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><ListFilter size={18} /> Drug Requests</h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1 bg-white border border-slate-200 rounded">Pharmacist Dashboard</span>
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
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{req.requesterName}</div>
                    <div className="text-xs text-slate-500">{req.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-slate-700">{req.genericName}</span>
                       <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>{req.urgency}</span>
                    </div>
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
                        onChange={(e) => handleRequestStatusUpdate(req.id, e.target.value as RequestStatus)}
                        className={`text-xs font-bold p-1 rounded border transition-colors ${!!req.isLocked ? 'bg-slate-50 opacity-50 cursor-not-allowed' : getStatusColorClasses(req.status)}`}
                      >
                        {Object.values(RequestStatus).map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
                      </select>
                      {user.role === UserRole.SUPER_ADMIN && (
                        <button onClick={() => handleLockToggle(req.id, 'REQUEST', !!req.isLocked)} title={!!req.isLocked ? "Unlock Record" : "Lock Record"} className={`p-1 rounded ${!!req.isLocked ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}>
                          {!!req.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => analyzeDrugRequest(req.genericName, req.notes)} className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">AI Audit</button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consults.map((c) => (
          <div key={c.id} className={`bg-white p-6 rounded-2xl border ${!!c.isLocked ? 'border-red-100' : 'border-slate-200'} shadow-sm relative group`}>
             <div className="absolute top-2 right-2 flex gap-2">
                {user.role === UserRole.SUPER_ADMIN && (
                  <button onClick={() => handleLockToggle(c.id, 'CONSULT', !!c.isLocked)} title={!!c.isLocked ? "Unlock" : "Lock"} className={`p-1.5 rounded-lg ${!!c.isLocked ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-400'}`}>
                    {!!c.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                )}
             </div>
             <div className="mb-4">
                <div className="font-extrabold text-lg text-slate-900">{c.patientName}</div>
                <div className="text-xs text-slate-500">{new Date(c.preferredDate).toLocaleString()}</div>
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
                 onChange={(e) => handleConsultStatusUpdate(c.id, e.target.value as ConsultStatus)}
                 className={`w-full text-xs font-bold p-2 rounded-xl border transition-colors ${!!c.isLocked ? 'bg-slate-50 cursor-not-allowed' : getStatusColorClasses(c.status)}`}
               >
                 {Object.values(ConsultStatus).map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
               </select>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PHARMACIST) && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[450px] flex flex-col">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-red-500" /> Drug Requests
            </h4>
            <div className="flex-grow w-full" style={{ minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie data={requestStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
               <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <div className="text-2xl font-black">{requests.length}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Total</div>
               </div>
               <div className="p-3 bg-emerald-50 rounded-xl text-center">
                  <div className="text-2xl font-black text-emerald-600">{requests.filter(r => r.status === RequestStatus.COMPLETED).length}</div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">Completed</div>
               </div>
            </div>
          </div>
        )}
        
        {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DOCTOR) && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[450px] flex flex-col">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Consultations
            </h4>
            <div className="flex-grow w-full" style={{ minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consultStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {consultStats.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {user.role === UserRole.SUPER_ADMIN && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[450px] flex flex-col">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-slate-900" /> Staff Distribution
            </h4>
            <div className="flex-grow w-full" style={{ minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={staffStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={{ fontSize: 10 }}>
                    {staffStats.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">Authorized Staff List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">{u.name[0]}</div>
                  <div>
                    <div className="font-bold text-sm">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold">@{u.username}</div>
                  </div>
                </div>
                <div className="text-[10px] font-black px-2 py-0.5 border rounded uppercase bg-slate-50">{u.role}</div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-3 border-t">
                 <span>Member since: {new Date(u.createdAt).toLocaleDateString()}</span>
                 {u.username !== user.username && (
                   <button onClick={() => setDeleteId(u.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl h-fit">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><UserPlus size={20} className="text-red-500" /> Provision Personnel</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
            <input required type="text" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</label>
            <input required type="text" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temporary Key</label>
            <input required type="password" placeholder="••••••••" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Permission Tier</label>
            <select className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
              <option value={UserRole.DOCTOR}>Medical Doctor</option>
              <option value={UserRole.PHARMACIST}>Pharmacist</option>
              <option value={UserRole.SUPER_ADMIN}>System Administrator</option>
            </select>
          </div>
          <button type="submit" className="w-full py-4 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-lg mt-4">Create Account</button>
        </form>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-xl mx-auto py-10">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Key className="text-slate-900" /> Update Security Key</h3>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          {passMsg.text && (
            <div className={`p-4 rounded-xl text-sm font-bold text-center ${passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{passMsg.text}</div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Key</label>
            <input required type="password" value={passForm.old} onChange={e => setPassForm({...passForm, old: e.target.value})} className="w-full border-slate-200 rounded-xl p-3 font-medium focus:ring-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Key</label>
              <input required type="password" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} className="w-full border-slate-200 rounded-xl p-3 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm Key</label>
              <input required type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} className="w-full border-slate-200 rounded-xl p-3 font-medium" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Update Access Key</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Easygo Command</h1>
            <p className="text-slate-500 font-medium">Operator: <span className="text-slate-900 font-bold">{user.name}</span> <span className="text-slate-400 text-xs ml-2 uppercase tracking-tighter">[{user.role}]</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
            </div>
            <button onClick={refreshData} title="Refresh System Data" className="p-3 bg-white border rounded-xl text-slate-400 hover:text-slate-900 transition-all"><Activity size={20} className={isLoading ? "animate-spin" : ""} /></button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="border-b border-slate-100 flex flex-wrap bg-white p-3 gap-2 sticky top-0 z-10">
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PHARMACIST) && <button onClick={() => setActiveTab('REQUESTS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'REQUESTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Drug Pipeline</button>}
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DOCTOR) && <button onClick={() => setActiveTab('CONSULTS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'CONSULTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Consultations</button>}
            <button onClick={() => setActiveTab('ANALYTICS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'ANALYTICS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Analytics</button>
            {user.role === UserRole.SUPER_ADMIN && <button onClick={() => setActiveTab('USERS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'USERS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Staff Management</button>}
            {user.role === UserRole.SUPER_ADMIN && <button onClick={() => setActiveTab('AUDIT')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'AUDIT' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Audit Logs</button>}
            <button onClick={() => setActiveTab('SETTINGS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'SETTINGS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Settings</button>
          </div>
          <div className="p-8 md:p-12 flex-grow bg-slate-50/30">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-300"><Loader2 className="animate-spin mb-4" size={48} /><span className="text-xs font-bold tracking-widest uppercase">Fetching encrypted records...</span></div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'REQUESTS' && renderRequests()}
                {activeTab === 'CONSULTS' && renderConsults()}
                {activeTab === 'ANALYTICS' && renderAnalytics()}
                {activeTab === 'USERS' && renderUsers()}
                {activeTab === 'SETTINGS' && renderSettings()}
                {activeTab === 'AUDIT' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><History className="text-slate-400" /> Immutable Audit Trail</h3>
                    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-[10px] font-black uppercase">Timestamp</th><th className="px-6 py-4 text-left text-[10px] font-black uppercase">Operator</th><th className="px-6 py-4 text-left text-[10px] font-black uppercase">Action</th></tr></thead>
                        <tbody className="divide-y divide-slate-200">{auditLogs.map(l => <tr key={l.id} className="text-sm font-medium"><td className="px-6 py-4 text-slate-500">{new Date(l.timestamp).toLocaleString()}</td><td className="px-6 py-4 font-bold">{l.user}</td><td className="px-6 py-4 text-slate-700 bg-slate-50/50">{l.action}</td></tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-red-100">
              <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6"><ShieldAlert size={32} /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Staff Account?</h3>
              <p className="text-slate-500 text-sm mb-8">This action will immediately revoke access. Historical logs will be preserved for compliance.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl">Cancel</button>
                <button onClick={() => handleDeleteStaff(deleteId)} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-900/20">Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
