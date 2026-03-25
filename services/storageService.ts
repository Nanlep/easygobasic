
import { DrugRequest, Consultation, AuditLog, RequestStatus, ConsultStatus, User, UserRole } from '../types';
import { supabase } from './supabaseClient';

export const StorageService = {
  // --- Supabase Auth: Users & Staff Management ---

  /**
   * Sign in with email + password via Supabase Auth.
   * Returns the user profile (with role from user_metadata) or null.
   */
  login: async (email: string, password: string): Promise<User & { mustResetPassword?: boolean } | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;

    const meta = data.user.user_metadata || {};
    return {
      id: data.user.id,
      username: meta.username || email,
      role: meta.role || UserRole.GUEST,
      name: meta.name || email,
      createdAt: data.user.created_at,
      status: 'ACTIVE',
      mustResetPassword: meta.mustResetPassword === true,
    } as User & { mustResetPassword?: boolean };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  /**
   * Gets the currently authenticated user from the Supabase session.
   */
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const meta = user.user_metadata || {};
    return {
      id: user.id,
      username: meta.username || user.email || '',
      role: meta.role || UserRole.GUEST,
      name: meta.name || user.email || '',
      createdAt: user.created_at,
      status: 'ACTIVE',
    } as User;
  },

  /**
   * Provision a new staff member via Supabase Auth.
   * Sets mustResetPassword flag so staff must change password on first login.
   */
  addUser: async (userData: { name: string; role: UserRole; password: string; email: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.email,
          name: userData.name,
          role: userData.role,
          mustResetPassword: true,
        }
      }
    });

    if (error) throw new Error(`Provisioning Error: ${error.message}`);

    StorageService.logAudit(`Provisioned staff: ${userData.name} (${userData.role})`, 'Admin');
    return {
      id: data.user?.id || '',
      username: userData.email,
      role: userData.role,
      name: userData.name,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE' as const,
    } as User;
  },

  /**
   * Clears the mustResetPassword flag after user sets their new password.
   */
  clearResetFlag: async () => {
    const { error } = await supabase.auth.updateUser({
      data: { mustResetPassword: false }
    });
    if (error) throw new Error(`Failed to clear reset flag: ${error.message}`);
  },

  /**
   * Get all staff users from the staff_profiles table.
   */
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn("Staff profiles fetch warning:", error.message);
      // Fallback: return just the current user
      const current = await StorageService.getCurrentUser();
      return current ? [current] : [];
    }
    return data || [];
  },

  /**
   * Update the current user's password via Supabase Auth.
   */
  updateUserPassword: async (_username: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(`Password Update Error: ${error.message}`);
    const user = await StorageService.getCurrentUser();
    StorageService.logAudit(`Password updated`, user?.name || 'System');
  },

  /**
   * Password reset: sends a reset email via Supabase Auth.
   * (The old system allowed direct reset — now it sends a secure email link)
   */
  resetPasswordByEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(`Reset Error: ${error.message}`);
    StorageService.logAudit(`Password reset email sent to: ${email}`, 'System');
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
    const user = await StorageService.getCurrentUser();
    const { data: existing, error: fetchError } = await supabase.from('drug_requests').select('*').eq('id', id).single();
    
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
    const user = await StorageService.getCurrentUser();
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
    const user = await StorageService.getCurrentUser();
    const { data: existing, error: fetchError } = await supabase.from('consultations').select('*').eq('id', id).single();
    
    if (!fetchError && existing && (existing as any).isLocked === true && user?.role !== UserRole.SUPER_ADMIN) {
      throw new Error("This record is locked by Administrator.");
    }

    const { error } = await supabase.from('consultations').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
    StorageService.logAudit(`Consult ${id} status: ${status}`, user?.name || 'System');
  },

  toggleConsultLock: async (id: string, isLocked: boolean) => {
    const user = await StorageService.getCurrentUser();
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
};
