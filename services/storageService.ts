
import { DrugRequest, Consultation, AuditLog, RequestStatus, ConsultStatus, User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'egp_session';
const USERS_KEY = 'egp_users';

export const StorageService = {
  // Users (Keeping local storage for session management in this prototype)
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
      return MOCK_USERS as User[];
    }
    return JSON.parse(data);
  },

  addUser: (user: Omit<User, 'id'> & { password?: string }) => {
    const current = StorageService.getUsers();
    const newUser = { ...user, id: Date.now().toString() };
    localStorage.setItem(USERS_KEY, JSON.stringify([...current, newUser]));
    StorageService.logAudit(`Created user ${user.username}`, 'Admin');
    return newUser;
  },

  // Drug Requests (Supabase - Sole source of truth to avoid localStorage quota errors)
  getRequests: async (): Promise<DrugRequest[]> => {
    const { data, error } = await supabase
      .from('drug_requests')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.warn("Supabase Fetch Error (Requests):", error);
      return [];
    }
    return data || [];
  },

  addRequest: async (req: Omit<DrugRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: Partial<DrugRequest> = {
      ...req,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: RequestStatus.PENDING
    };

    const { error } = await supabase
      .from('drug_requests')
      .insert([newReq]);

    if (error) {
      console.error("Supabase Insert Error (Request):", error);
      throw new Error(`Database Error: ${error.message}`);
    }
    
    StorageService.logAudit('New Drug Request', 'System');
    return newReq as DrugRequest;
  },

  updateRequestStatus: async (id: string, status: RequestStatus, aiAnalysis?: string, aiSources?: any[]) => {
    const { error } = await supabase
      .from('drug_requests')
      .update({ status, aiAnalysis, aiSources })
      .eq('id', id);

    if (error) {
      console.error("Supabase Update Error:", error);
      throw new Error(`Database Update Error: ${error.message}`);
    }
    
    StorageService.logAudit(`Request ${id} updated to ${status}`, 'Admin');
  },

  // Consultations (Supabase - Sole source of truth)
  getConsultations: async (): Promise<Consultation[]> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn("Supabase Fetch Error (Consultations):", error);
      return [];
    }
    return data || [];
  },

  addConsultation: async (consult: Omit<Consultation, 'id' | 'createdAt' | 'status'>) => {
    const newConsult: Partial<Consultation> = {
      ...consult,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: ConsultStatus.SCHEDULED
    };

    const { error } = await supabase.from('consultations').insert([newConsult]);
    
    if (error) {
      console.error("Supabase Insert Error (Consultation):", error);
      throw new Error(`Database Error: ${error.message}`);
    }

    StorageService.logAudit('New Consultation Booked', 'System');
    return newConsult as Consultation;
  },

  // Audit (Supabase)
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

  // Auth
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
  },
  updatePassword: (username: string, newPassword: string) => {
    const users = StorageService.getUsers();
    const updated = users.map((u: any) => u.username === username ? { ...u, password: newPassword } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  }
};
