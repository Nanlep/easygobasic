
import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Key, Save } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    try {
      await StorageService.updateUserPassword('', passForm.new);
      setPassMsg({ type: 'success', text: 'Password successfully updated.' });
      setPassForm({ old: '', new: '', confirm: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: 'Update failed.' });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Key className="text-slate-900" /> Update Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          {passMsg.text && (
            <div className={`p-4 rounded-xl text-sm font-bold text-center ${passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{passMsg.text}</div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
            <input required type="password" value={passForm.old} onChange={e => setPassForm({...passForm, old: e.target.value})} className="w-full border-slate-200 rounded-xl p-3 font-medium focus:ring-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <input required type="password" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} className="w-full border-slate-200 rounded-xl p-3 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
              <input required type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} className="w-full border-slate-200 rounded-xl p-3 font-medium" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Update Password</button>
        </form>
      </div>
    </div>
  );
};
