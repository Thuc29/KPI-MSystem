// API Response Types
export interface IBackendRes<T> {
  message: string;
  statusCode: number | string;
  data: T;
}

// User Types
export interface IUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department: string;
  token?: string;
}

export type UserRole = 'employee' | 'manager' | 'hr' | 'ceo';

// KPI Types
export interface IKPITarget {
  id: string;
  title: string;
  description: string;
  weight: number;
  target: string;
  unit: string;
  category?: string;
  measurementMethod?: string;
  evaluationCriteria?: string;
  startDate?: string;
  endDate?: string;
  currentValue?: number;
  completionRate?: number;
}

export interface IKPIRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position?: string;
  year: number;
  quarter?: number;
  period?: 'yearly' | 'quarterly' | 'monthly';
  status: KPIStatus;
  targets: IKPITarget[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  currentApprover?: string;
  rejectionReason?: string;
  isOnTrack?: boolean;
}

export type KPIStatus = 
  | 'draft' 
  | 'pending_manager' 
  | 'pending_hr' 
  | 'pending_ceo' 
  | 'approved' 
  | 'rejected';

// Approval History Types
export interface IApprovalHistory {
  id: string;
  kpiId: string;
  approver: string;
  role: UserRole;
  action: ApprovalAction;
  comment?: string;
  timestamp: string;
}

export type ApprovalAction = 
  | 'submit' 
  | 'approve' 
  | 'reject' 
  | 'request_revision';

// Form Types
export interface LoginFormValues {
  username: string;
  password: string;
}

export interface KPITargetFormValues {
  title: string;
  description: string;
  weight: number;
  target: string;
  unit: string;
}

export interface RejectFormValues {
  reason: string;
}

// Export notification types
export * from './notification';

// Export KPI template types
export * from './kpiTemplate';

// Export progress types
export * from './progress';
