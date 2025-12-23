export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DOCTOR = 'DOCTOR',
  PHARMACIST = 'PHARMACIST',
  GUEST = 'GUEST'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED'
}

export enum ConsultStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface DrugRequest {
  id: string;
  requesterName: string;
  requesterType: 'CLINIC' | 'PATIENT';
  contactEmail: string;
  drugName: string;
  quantity: string;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  notes: string;
  status: RequestStatus;
  createdAt: string;
  aiAnalysis?: string; // Field for Gemini analysis
}

export interface Consultation {
  id: string;
  patientName: string;
  contactEmail: string;
  preferredDate: string;
  reason: string;
  status: ConsultStatus;
  createdAt: string;
  doctorNotes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}