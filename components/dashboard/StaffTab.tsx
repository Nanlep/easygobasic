
import React, { useState } from 'react';
import { UserRole, User } from '../../types';
import { StorageService } from '../../services/storageService';
import { EmailService } from '../../services/emailService';
import { UserPlus, Trash2, Ban, RotateCcw } from 'lucide-react';

interface StaffTabProps {
  users: User[];
  onRefresh: () => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({ users, onRefresh }) => {
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: UserRole.DOCTOR });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await StorageService.addUser(newUser);
      
      // Trigger Welcome Email
      EmailService.sendWelcomeEmail(newUser.email, newUser.name, newUser.role);
      
      setNewUser({ name: '', email: '', password: '', role: UserRole.DOCTOR });
      setMsg({ type: 'success', text: 'Staff provisioned. Welcome email sent to ' + created.username });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
      onRefresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Provisioning failed.' });
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await StorageService.updateStaffStatus(id, newStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the staff list?`)) return;
    try {
      await StorageService.deleteStaff(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">Authorized Staff List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className={`bg-white p-5 rounded-2xl border ${u.status === 'SUSPENDED' ? 'border-red-50 bg-slate-50 opacity-60' : 'border-slate-200'} shadow-sm flex flex-col justify-between transition-all`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">{u.name?.[0] || '?'}</div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {u.name}
                        {u.status === 'SUSPENDED' && <span className="text-[8px] bg-red-600 text-white px-1 rounded">SUSPENDED</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">{u.username}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black px-2 py-0.5 border rounded uppercase bg-slate-50">{u.role}</div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => handleStatusToggle(u.id, u.status)}
                    title={u.status === 'ACTIVE' ? "Suspend" : "Restore"}
                    className={`p-2 rounded-lg transition-colors ${u.status === 'ACTIVE' ? 'bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50' : 'bg-emerald-100 text-emerald-600'}`}>
                    {u.status === 'ACTIVE' ? <Ban size={14} /> : <RotateCcw size={14} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(u.id, u.name)}
                    title="Remove"
                    className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-3 border-t">
                <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl h-fit">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><UserPlus size={20} className="text-red-500" /> Provision Personnel</h3>
        {msg.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-bold text-center ${msg.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>{msg.text}</div>
        )}
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
            <input required type="text" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" placeholder="Dr. Jane Smith" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
            <input required type="email" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" placeholder="staff@easygopharm.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</label>
            <select className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
              <option value={UserRole.DOCTOR}>Medical Doctor</option>
              <option value={UserRole.PHARMACIST}>Pharmacist</option>
              <option value={UserRole.SUPER_ADMIN}>System Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temporary Password</label>
            <input required type="password" placeholder="Min 6 characters" minLength={6} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <p className="text-[9px] text-slate-500 mt-1">Staff will be required to change this on first login.</p>
          </div>
          <button type="submit" className="w-full py-4 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-lg mt-4">Create Staff Account</button>
        </form>
      </div>
    </div>
  );
};
