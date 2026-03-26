
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DOCTOR = 'DOCTOR',
  PHARMACIST = 'PHARMACIST',
  GUEST = 'GUEST'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ConsultStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface DrugItem {
  genericName: string;
  brandName?: string;
  dosageStrength?: string;
  quantity: string;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export interface DrugRequest {
  id: string;
  requesterName: string;
  requesterType: string;
  contactEmail: string;
  contactPhone?: string;
  address: string;
  // Legacy single-drug fields (backward compat with old rows)
  genericName: string;
  brandName?: string;
  dosageStrength?: string;
  quantity: string;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  // Multi-drug support
  drugs?: DrugItem[];
  notes: string;
  status: RequestStatus;
  createdAt: string;
  aiAnalysis?: string;
  aiSources?: { title: string; uri: string }[];
  prescription?: { fileName: string; data: string; mimeType: string };
  isLocked?: boolean;
}

export interface Consultation {
  id: string;
  patientName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  preferredDate: string;
  reason: string;
  status: ConsultStatus;
  createdAt: string;
  doctorNotes?: string;
  attachment?: { fileName: string; data: string; mimeType: string };
  isLocked?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}
