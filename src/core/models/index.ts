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
  position?: string;
  managerId?: string;
  managerName?: string;
  teamMembers?: string[];
  token?: string;
  delegations?: IDelegation[];
  isActive?: boolean;
}

export type UserRole = 'employee' | 'tl' | 'gl' | 'ceo';

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
  tasks?: ITaskItem[];
  attachments?: IAttachment[];
  adjustmentRequested?: boolean;
  adjustmentReason?: string;
  adjustmentApprovedAt?: string;
}

export interface IKPIGroup {
  id: string;
  name: string;
  description?: string;
  targets: IKPITarget[];
}

export interface IKPIRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position?: string;
  managerId?: string;
  managerName?: string;
  year: number;
  quarter?: number;
  period?: 'yearly' | 'quarterly' | 'monthly';
  status: KPIStatus;
  targets: IKPITarget[];
  groups?: IKPIGroup[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  currentApprover?: string;
  rejectionReason?: string;
  isOnTrack?: boolean;
  isFrozen?: boolean;
  frozenAt?: string;
  frozenReason?: string;
}

export type KPIStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'in_progress' 
  | 'completed' 
  | 'rejected';

export type TaskStatus =
  | 'to_do'
  | 'pending_verify'
  | 'verified'
  | 'overdue';

export interface ITaskItem {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: TaskStatus;
  evidenceUrl?: string;
  evidenceFiles?: IAttachment[];
  evidenceMessage?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  appealMessage?: string;
  appealedAt?: string;
  extensionRequested?: boolean;
  extensionReason?: string;
  newDeadline?: string;
}

export interface IAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface IDelegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

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
  | 'request_revision'
  | 'verify_task'
  | 'reject_task'
  | 'approve_extension'
  | 'reject_extension'
  | 'approve_adjustment'
  | 'reject_adjustment'
  | 'appeal_task'
  | 'resolve_appeal';

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

// Export task types
export * from './task';

// Export strategy types
export * from './strategy';
