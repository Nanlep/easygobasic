import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { analyzeDrugRequest } from '../../services/geminiService';
import { UserRole, DrugRequest, Consultation, RequestStatus, AuditLog, User } from '../../types';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { ShieldAlert, BrainCircuit, UserPlus, Save, AlertCircle, Key, User as UserIcon } from 'lucide-react';

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
    const analysis = await analyzeDrugRequest(drugName, notes);
    StorageService.updateRequestStatus(id, RequestStatus.PROCESSING, analysis);
    setAnalyzingId(null);
    refreshData();
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
      setNewUser({ name: '', username: '', password: '', role: UserRole.DOCTOR }); // Reset form
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

  if (!user) return <div>Access Denied</div>;

  // Stats for Charts
  const statsData = [
    { name: 'Pending', value: requests.filter(r => r.status === RequestStatus.PENDING).length },
    { name: 'Processing', value: requests.filter(r => r.status === RequestStatus.PROCESSING).length },
    { name: 'Fulfilled', value: requests.filter(r => r.status === RequestStatus.FULFILLED).length },
  ];

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4">Pending Requests Queue</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Drug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{req.id.slice(-4)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{req.drugName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' : req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {req.requesterName} <br/> <span className="text-xs">{req.requesterType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {req.status === RequestStatus.PENDING && (
                      <button 
                        onClick={() => handleAnalyzeRequest(req.id, req.drugName, req.notes)}
                        disabled={analyzingId === req.id}
                        className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                      >
                       <BrainCircuit size={16} /> {analyzingId === req.id ? 'Analyzing...' : 'AI Analysis'}
                      </button>
                    )}
                    {req.status === RequestStatus.PROCESSING && (
                      <button onClick={() => handleStatusUpdate(req.id, RequestStatus.FULFILLED)} className="text-green-600 hover:text-green-900">Fulfill</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* AI Insights Panel (Only show if there are analyses) */}
      <div className="grid gap-4">
        {requests.filter(r => r.aiAnalysis).map(req => (
           <div key={`analysis-${req.id}`} className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                 <BrainCircuit className="text-purple-600" size={20} />
                 <h4 className="font-semibold text-purple-900">AI Insight for {req.drugName}</h4>
              </div>
              <p className="text-sm text-purple-800 whitespace-pre-line">{req.aiAnalysis}</p>
           </div>
        ))}
      </div>
    </div>
  );

  const renderConsults = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Scheduled Consultations</h3>
      <div className="grid gap-4">
        {consults.map((consult) => (
          <div key={consult.id} className="border p-4 rounded-lg hover:bg-slate-50 transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-slate-900">{consult.patientName}</h4>
                <p className="text-sm text-slate-500">{consult.contactEmail}</p>
                <div className="mt-2 text-sm text-slate-700 bg-slate-100 p-2 rounded">
                  Reason: {consult.reason}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{new Date(consult.preferredDate).toLocaleString()}</div>
                <span className="px-2 mt-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {consult.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {consults.length === 0 && <p className="text-slate-500">No scheduled consultations.</p>}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserPlus size={20} /> Add New Staff
        </h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" 
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
               <input 
                required
                type="text" 
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" 
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
               <input 
                required
                type="password" 
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" 
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
               />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" 
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
            >
              <option value={UserRole.DOCTOR}>Doctor</option>
              <option value={UserRole.PHARMACIST}>Pharmacist</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>
          
          {userFormError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle size={16} /> {userFormError}
            </div>
          )}
           {userFormSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <Save size={16} /> {userFormSuccess}
            </div>
          )}

          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800">
            Create User Account
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4">Current Staff Directory</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {users.map((u) => (
            <div key={u.username} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <div className="font-medium text-slate-900">{u.name}</div>
                <div className="text-xs text-slate-500">@{u.username}</div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                u.role === UserRole.DOCTOR ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
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
     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ShieldAlert className="text-slate-900" />
        System Audit Log (ISO 27001 Requirement)
      </h3>
      <div className="overflow-hidden bg-slate-900 rounded-lg text-xs font-mono text-green-400 p-4 h-96 overflow-y-auto">
        {auditLogs.map(log => (
          <div key={log.id} className="mb-1 border-b border-slate-800 pb-1">
            <span className="text-slate-500">[{new Date(log.timestamp).toISOString()}]</span>{" "}
            <span className="text-yellow-500">USER:{log.user}</span>{" "}
            <span className="text-white">ACTION:{log.action}</span>
          </div>
        ))}
      </div>
     </div>
  );

  const renderProfile = () => (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Key size={20} /> Security Settings
      </h3>
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800">
        <strong className="block mb-1">Security Notice</strong>
        For SOC 2 compliance, please ensure your password is at least 12 characters long and contains mixed case letters, numbers, and symbols.
      </div>
      
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
          <input 
            required
            type="password" 
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" 
            value={passwordForm.new}
            onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
          <input 
            required
            type="password" 
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" 
            value={passwordForm.confirm}
            onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
          />
        </div>

        {passMsg.text && (
          <div className={`p-3 rounded text-sm ${passMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {passMsg.text}
          </div>
        )}

        <button type="submit" className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800">
          Update Password
        </button>
      </form>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500 uppercase font-semibold">Total Requests</div>
            <div className="text-3xl font-bold text-slate-900">{requests.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500 uppercase font-semibold">Consultations</div>
            <div className="text-3xl font-bold text-blue-600">{consults.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="text-sm text-slate-500 uppercase font-semibold">Staff Count</div>
             <div className="text-3xl font-bold text-purple-600">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
             <ResponsiveContainer width="100%" height={60}>
               <BarChart data={statsData}>
                 <Bar dataKey="value" fill="#b91c1c" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          <div className="border-b border-slate-200 flex flex-wrap">
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PHARMACIST) && (
              <button 
                onClick={() => setActiveTab('REQUESTS')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'REQUESTS' ? 'border-b-2 border-red-700 text-red-700 bg-red-50' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Drug Requests
              </button>
            )}
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DOCTOR) && (
              <button 
                onClick={() => setActiveTab('CONSULTS')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'CONSULTS' ? 'border-b-2 border-red-700 text-red-700 bg-red-50' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Consultations
              </button>
            )}
            {user.role === UserRole.SUPER_ADMIN && (
              <button 
                onClick={() => setActiveTab('USERS')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'USERS' ? 'border-b-2 border-red-700 text-red-700 bg-red-50' : 'text-slate-600 hover:text-slate-900'}`}
              >
                User Management
              </button>
            )}
            {user.role === UserRole.SUPER_ADMIN && (
              <button 
                onClick={() => setActiveTab('AUDIT')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'AUDIT' ? 'border-b-2 border-red-700 text-red-700 bg-red-50' : 'text-slate-600 hover:text-slate-900'}`}
              >
                System Audit
              </button>
            )}
            <button 
              onClick={() => setActiveTab('PROFILE')}
              className={`px-6 py-4 text-sm font-medium ml-auto flex items-center gap-2 ${activeTab === 'PROFILE' ? 'border-b-2 border-red-700 text-red-700 bg-red-50' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <UserIcon size={16} /> My Profile
            </button>
          </div>
          
          <div className="p-6">
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