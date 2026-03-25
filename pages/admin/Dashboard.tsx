
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { supabase } from '../../services/supabaseClient';
import { UserRole, DrugRequest, Consultation, AuditLog, User } from '../../types';
import { Activity, Loader2 } from 'lucide-react';

// Extracted Tab Components
import { DrugPipeline } from '../../components/dashboard/DrugPipeline';
import { ConsultationsTab } from '../../components/dashboard/ConsultationsTab';
import { AnalyticsTab } from '../../components/dashboard/AnalyticsTab';
import { StaffTab } from '../../components/dashboard/StaffTab';
import { AuditTab } from '../../components/dashboard/AuditTab';
import { SettingsTab } from '../../components/dashboard/SettingsTab';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<DrugRequest[]>([]);
  const [consults, setConsults] = useState<Consultation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'CONSULTS' | 'USERS' | 'AUDIT' | 'ANALYTICS' | 'SETTINGS'>('REQUESTS');

  // Initial load
  useEffect(() => {
    StorageService.getCurrentUser().then((u) => {
      setUser(u);
      setIsUserLoading(false);
      if (u?.role === UserRole.DOCTOR) setActiveTab('CONSULTS');
      else if (u?.role === UserRole.PHARMACIST) setActiveTab('REQUESTS');
    });
    refreshData();
  }, []);

  // Supabase Realtime Subscriptions
  useEffect(() => {
    if (!user) return;

    // Listen to changes on requests and consults
    const channel = supabase.channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drug_requests' }, () => {
        // Debounce or just trigger refresh
        refreshData(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => {
        refreshData(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        refreshData(false);
      })
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const refreshData = async (showLoadingOverlay = true) => {
    if (showLoadingOverlay) setIsLoading(true);
    try {
      const [reqs, appointments, logs, staff] = await Promise.all([
        StorageService.getRequests(),
        StorageService.getConsultations(),
        StorageService.getAuditLogs(),
        StorageService.getUsers()
      ]);
      setRequests(reqs);
      setConsults(appointments);
      setAuditLogs(logs);
      setUsers(staff);
    } catch (e) {
      console.error("Dashboard refresh error:", e);
    } finally {
      if (showLoadingOverlay) setIsLoading(false);
    }
  };

  const getRequestStatusClasses = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-100';
      case 'PENDING': return 'text-slate-400 bg-slate-50 border-slate-200';
      default: return 'text-slate-700 bg-white border-slate-200';
    }
  };

  if (isUserLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!user) return <div className="p-8 text-center text-red-600 font-bold">Access Denied.</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Easygo Command</h1>
            <p className="text-slate-500 font-medium">Operator: <span className="text-slate-900 font-bold">{user.name}</span> <span className="text-slate-400 text-xs ml-2 uppercase tracking-tighter">[{user.role}]</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 bg-white border ${isLive ? 'border-emerald-200' : 'border-slate-200'} rounded-lg shadow-sm transition-colors`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isLive ? 'Live Updates' : 'Connecting...'}</span>
            </div>
            <button onClick={() => refreshData(true)} title="Manual Refresh" className="p-3 bg-white border rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <Activity size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="border-b border-slate-100 flex flex-wrap bg-white p-3 gap-2 sticky top-0 z-10">
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PHARMACIST) && (
              <button onClick={() => setActiveTab('REQUESTS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'REQUESTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Drug Pipeline</button>
            )}
            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DOCTOR) && (
              <button onClick={() => setActiveTab('CONSULTS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'CONSULTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Consultations</button>
            )}
            <button onClick={() => setActiveTab('ANALYTICS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'ANALYTICS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Analytics</button>
            {user.role === UserRole.SUPER_ADMIN && (
              <>
                <button onClick={() => setActiveTab('USERS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'USERS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Staff</button>
                <button onClick={() => setActiveTab('AUDIT')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'AUDIT' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Audit Logs</button>
              </>
            )}
            <button onClick={() => setActiveTab('SETTINGS')} className={`px-6 py-3 text-xs font-extrabold rounded-2xl ${activeTab === 'SETTINGS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>Settings</button>
          </div>
          
          <div className="p-8 md:p-12 flex-grow bg-slate-50/30">
            {isLoading && requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-300">
                <Loader2 className="animate-spin mb-4" size={48} />
                <span className="text-xs font-bold tracking-widest uppercase">Fetching encrypted records...</span>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'REQUESTS' && (
                  <DrugPipeline requests={requests} user={user} onRefresh={() => refreshData(true)} getStatusColorClasses={getRequestStatusClasses} />
                )}
                {activeTab === 'CONSULTS' && (
                  <ConsultationsTab consults={consults} user={user} onRefresh={() => refreshData(true)} getStatusColorClasses={getRequestStatusClasses} />
                )}
                {activeTab === 'ANALYTICS' && (
                  <AnalyticsTab requests={requests} consults={consults} users={users} user={user} />
                )}
                {activeTab === 'USERS' && (
                  <StaffTab users={users} onRefresh={() => refreshData(true)} />
                )}
                {activeTab === 'AUDIT' && (
                  <AuditTab auditLogs={auditLogs} />
                )}
                {activeTab === 'SETTINGS' && (
                  <SettingsTab />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
