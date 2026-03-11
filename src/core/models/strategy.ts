// Strategic Plan Types for Group Leader

export interface ITeamPlan {
  id: string;
  teamName: string;
  teamLeaderId: string;
  teamLeaderName: string;
  objectives: ITeamObjective[];
  budget?: number;
  resources?: string[];
  timeline?: {
    startDate: string;
    endDate: string;
  };
}

export interface ITeamObjective {
  id: string;
  title: string;
  description: string;
  weight: number;
  target: string;
  unit: string;
  category?: string;
  kpiIds?: string[]; // Reference to team KPIs
  measurementMethod?: string;
  evaluationCriteria?: string;
  startDate?: string;
  endDate?: string;
  expectedOutcome?: string;
  risks?: string[];
  mitigationPlan?: string;
}

export interface IStrategicPlan {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  groupLeaderId: string;
  groupLeaderName: string;
  year: number;
  quarter?: number;
  period?: 'yearly' | 'quarterly' | 'half-yearly';
  status: StrategyStatus;
  teamPlans: ITeamPlan[];
  overallObjectives?: string[];
  expectedImpact?: string;
  totalBudget?: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  attachments?: IStrategyAttachment[];
}

export type StrategyStatus = 
  | 'draft' 
  | 'pending_ceo' 
  | 'approved' 
  | 'rejected'
  | 'in_execution'
  | 'completed';

export interface IStrategyAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface IStrategyApprovalHistory {
  id: string;
  strategyId: string;
  approver: string;
  role: 'ceo';
  action: 'submit' | 'approve' | 'reject' | 'request_revision';
  comment?: string;
  timestamp: string;
}
