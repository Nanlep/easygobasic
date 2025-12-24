
import { DrugRequest, Consultation, AuditLog, RequestStatus, ConsultStatus, User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'egp_session';
const USERS_KEY = 'egp_users';

export const StorageService = {
  // --- Users & Staff Management ---
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
      return MOCK_USERS as User[];
    }
    return JSON.parse(data);
  },

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'status'> & { password?: string }) => {
    const current = StorageService.getUsers();
    const newUser = { 
      ...user, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      status: 'ACTIVE' as const
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...current, newUser]));
    StorageService.logAudit(`Provisioned staff: ${user.username} (${user.role})`, 'Admin');
    return newUser;
  },

  deleteUser: (userId: string) => {
    const users = StorageService.getUsers();
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    const updated = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    StorageService.logAudit(`Deleted staff account: ${userToDelete.username}`, 'Admin');
    
    const current = StorageService.getCurrentUser();
    if (current && current.id === userId) {
      StorageService.logout();
    }
  },

  updateUserPassword: (username: string, newPassword: string) => {
    const users = StorageService.getUsers();
    const updated = users.map((u: any) => u.username === username ? { ...u, password: newPassword } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    StorageService.logAudit(`Password updated for user: ${username}`, username);
  },

  resetPasswordByUsername: (username: string, newPassword: string) => {
    const users = StorageService.getUsers();
    const exists = users.some((u: any) => u.username === username);
    if (!exists) throw new Error("User identifier not found.");
    
    const updated = users.map((u: any) => u.username === username ? { ...u, password: newPassword } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    StorageService.logAudit(`External password reset for user: ${username}`, 'System');
  },

  // --- Drug Requests ---
  getRequests: async (): Promise<DrugRequest[]> => {
    const { data, error } = await supabase
      .from('drug_requests')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) console.warn("Supabase fetch warning:", error.message);
    return data || [];
  },

  addRequest: async (req: Omit<DrugRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: any = {
      ...req,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: RequestStatus.PENDING,
    };
    
    // Attempt with isLocked, fallback if column missing
    const { error } = await supabase.from('drug_requests').insert([{ ...newReq, isLocked: false }]);
    
    if (error && error.message.includes('isLocked')) {
      const { error: retryError } = await supabase.from('drug_requests').insert([newReq]);
      if (retryError) throw new Error(`Database Error: ${retryError.message}`);
    } else if (error) {
      throw new Error(`Database Error: ${error.message}`);
    }

    StorageService.logAudit('New Drug Request', 'System');
    return newReq as DrugRequest;
  },

  updateRequestStatus: async (id: string, status: RequestStatus, aiAnalysis?: string, aiSources?: any[]) => {
    const user = StorageService.getCurrentUser();
    const { data: existing, error: fetchError } = await supabase.from('drug_requests').select('*').eq('id', id).single();
    
    // Safely check isLocked if property exists
    if (!fetchError && existing && (existing as any).isLocked === true && user?.role !== UserRole.SUPER_ADMIN) {
      throw new Error("This record is locked by Administrator. Status changes are restricted.");
    }

    const { error } = await supabase
      .from('drug_requests')
      .update({ status, aiAnalysis, aiSources })
      .eq('id', id);

    if (error) throw new Error(`Update Error: ${error.message}`);
    StorageService.logAudit(`Request ${id} status: ${status}`, user?.name || 'System');
  },

  toggleRequestLock: async (id: string, isLocked: boolean) => {
    const user = StorageService.getCurrentUser();
    if (user?.role !== UserRole.SUPER_ADMIN) throw new Error("Unauthorized lock toggle.");
    
    const { error } = await supabase
      .from('drug_requests')
      .update({ isLocked })
      .eq('id', id);
      
    if (error) {
       if (error.message.includes('isLocked') || error.code === '42703') {
         throw new Error("Schema Mismatch: Please run the SQL migration to add the 'isLocked' column to 'drug_requests'.");
       }
       throw new Error(error.message);
    }
    StorageService.logAudit(`Request ${id} ${isLocked ? 'LOCKED' : 'UNLOCKED'}`, 'Admin');
  },

  // --- Consultations ---
  getConsultations: async (): Promise<Consultation[]> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) console.warn("Supabase fetch warning:", error.message);
    return data || [];
  },

  addConsultation: async (consult: Omit<Consultation, 'id' | 'createdAt' | 'status'>) => {
    const newConsult: any = {
      ...consult,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: ConsultStatus.PENDING,
    };
    
    const { error } = await supabase.from('consultations').insert([{ ...newConsult, isLocked: false }]);
    
    if (error && error.message.includes('isLocked')) {
      const { error: retryError } = await supabase.from('consultations').insert([newConsult]);
      if (retryError) throw new Error(`Database Error: ${retryError.message}`);
    } else if (error) {
      throw new Error(`Database Error: ${error.message}`);
    }

    StorageService.logAudit('New Consultation Booked', 'System');
    return newConsult as Consultation;
  },

  updateConsultStatus: async (id: string, status: ConsultStatus) => {
    const user = StorageService.getCurrentUser();
    const { data: existing, error: fetchError } = await supabase.from('consultations').select('*').eq('id', id).single();
    
    if (!fetchError && existing && (existing as any).isLocked === true && user?.role !== UserRole.SUPER_ADMIN) {
      throw new Error("This record is locked by Administrator.");
    }

    const { error } = await supabase.from('consultations').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
    StorageService.logAudit(`Consult ${id} status: ${status}`, user?.name || 'System');
  },

  toggleConsultLock: async (id: string, isLocked: boolean) => {
    const user = StorageService.getCurrentUser();
    if (user?.role !== UserRole.SUPER_ADMIN) throw new Error("Unauthorized.");
    
    const { error } = await supabase.from('consultations').update({ isLocked }).eq('id', id);
    if (error) {
      if (error.message.includes('isLocked') || error.code === '42703') {
        throw new Error("Schema Mismatch: Please run the SQL migration to add the 'isLocked' column to 'consultations'.");
      }
      throw new Error(error.message);
    }
    StorageService.logAudit(`Consult ${id} ${isLocked ? 'LOCKED' : 'UNLOCKED'}`, 'Admin');
  },

  logAudit: async (action: string, user: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      user,
      timestamp: new Date().toISOString()
    };
    await supabase.from('audit_logs').insert([newLog]);
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  login: (username: string, password: string): User | null => {
    const users = StorageService.getUsers();
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      const { password, ...safeUser } = user as any;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },
  logout: () => localStorage.removeItem(SESSION_KEY),
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
};
