import { DrugRequest, Consultation, AuditLog, RequestStatus, ConsultStatus, User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

const REQUESTS_KEY = 'egp_requests';
const CONSULTS_KEY = 'egp_consults';
const AUDIT_KEY = 'egp_audit';
const SESSION_KEY = 'egp_session';
const USERS_KEY = 'egp_users';

export const StorageService = {
  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      // Seed initial users if empty
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
      return MOCK_USERS as User[];
    }
    return JSON.parse(data);
  },
  addUser: (user: Omit<User, 'id'> & { password?: string }) => {
    const current = StorageService.getUsers();
    if (current.find(u => u.username === user.username)) {
      throw new Error("Username already exists");
    }
    const newUser = {
      ...user,
      id: Date.now().toString(),
    };
    // In a real app, password should be hashed. Storing plain for demo.
    localStorage.setItem(USERS_KEY, JSON.stringify([...current, newUser]));
    StorageService.logAudit(`Created user ${user.username} as ${user.role}`, 'Admin');
    return newUser;
  },
  updatePassword: (username: string, newPassword: string) => {
    const current = StorageService.getUsers();
    const updated = current.map((u: any) => {
      if (u.username === username) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    StorageService.logAudit('Password Changed', username);
  },

  // Requests
  getRequests: (): DrugRequest[] => {
    const data = localStorage.getItem(REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  addRequest: (req: Omit<DrugRequest, 'id' | 'createdAt' | 'status'>) => {
    const current = StorageService.getRequests();
    const newReq: DrugRequest = {
      ...req,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: RequestStatus.PENDING
    };
    localStorage.setItem(REQUESTS_KEY, JSON.stringify([newReq, ...current]));
    StorageService.logAudit('New Drug Request', 'System');
    return newReq;
  },
  updateRequestStatus: (id: string, status: RequestStatus, aiAnalysis?: string) => {
    const current = StorageService.getRequests();
    const updated = current.map(r => r.id === id ? { ...r, status, aiAnalysis: aiAnalysis || r.aiAnalysis } : r);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
    StorageService.logAudit(`Request ${id} updated to ${status}`, 'Admin');
  },

  // Consultations
  getConsultations: (): Consultation[] => {
    const data = localStorage.getItem(CONSULTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  addConsultation: (consult: Omit<Consultation, 'id' | 'createdAt' | 'status'>) => {
    const current = StorageService.getConsultations();
    const newConsult: Consultation = {
      ...consult,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: ConsultStatus.SCHEDULED
    };
    localStorage.setItem(CONSULTS_KEY, JSON.stringify([newConsult, ...current]));
    StorageService.logAudit('New Consultation Booked', 'System');
    return newConsult;
  },

  // Audit
  getAuditLogs: (): AuditLog[] => {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  },
  logAudit: (action: string, user: string) => {
    const current = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      user,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(AUDIT_KEY, JSON.stringify([newLog, ...current].slice(0, 100))); // Keep last 100
  },

  // Auth
  login: (username: string, password: string): User | null => {
    const users = StorageService.getUsers();
    // In production, compare hashed passwords
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      // Remove password from session object
      const { password, ...safeUser } = user as any;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      StorageService.logAudit('Login Success', safeUser.username);
      return safeUser as User;
    }
    return null;
  },
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
};