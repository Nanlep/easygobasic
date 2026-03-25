
import React from 'react';
import { DrugRequest, Consultation, RequestStatus, ConsultStatus, UserRole, User } from '../../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { BarChart3, Activity, ShieldCheck } from 'lucide-react';

interface AnalyticsTabProps {
  requests: DrugRequest[];
  consults: Consultation[];
  users: User[];
  user: User;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ requests, consults, users, user }) => {
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

  return (
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
};
