import type { UserRole, IKPIRecord } from '../../core/models';

/**
 * Get direct approver based on employee role
 * Luồng phê duyệt 1 cấp: Employee -> TL -> GL -> CEO
 */
export const getDirectApprover = (employeeRole: UserRole): UserRole | null => {
  switch (employeeRole) {
    case 'employee':
      return 'tl';
    case 'tl':
      return 'gl';
    case 'gl':
      return 'ceo';
    case 'ceo':
      return null; // CEO không cần phê duyệt
    default:
      return null;
  }
};

/**
 * Check if user can approve KPI
 */
export const canApproveKPI = (userRole: UserRole, kpiRecord: IKPIRecord): boolean => {
  // Chỉ quản lý trực tiếp mới có quyền duyệt
  return userRole === kpiRecord.currentApprover;
};

/**
 * Check if user can view KPI
 */
export const canViewKPI = (
  userRole: UserRole, 
  userId: string, 
  kpiRecord: IKPIRecord,
  teamMembers?: string[]
): boolean => {
  // Employee: chỉ xem KPI của mình
  if (userRole === 'employee') {
    return kpiRecord.employeeId === userId;
  }
  
  // TL: xem KPI của bản thân và nhân viên trong team
  if (userRole === 'tl') {
    return kpiRecord.employeeId === userId || teamMembers?.includes(kpiRecord.employeeId) || false;
  }
  
  // GL: xem KPI của bản thân, TL trực thuộc và nhân viên trong khối
  if (userRole === 'gl') {
    return kpiRecord.employeeId === userId || kpiRecord.department === kpiRecord.department;
  }
  
  // CEO: xem tất cả
  if (userRole === 'ceo') {
    return true;
  }
  
  return false;
};

/**
 * Get dashboard view based on role
 */
export const getDashboardScope = (role: UserRole): string => {
  switch (role) {
    case 'employee':
      return 'personal';
    case 'tl':
      return 'team';
    case 'gl':
      return 'department';
    case 'ceo':
      return 'company';
    default:
      return 'personal';
  }
};

/**
 * Check if KPI can be edited
 */
export const canEditKPI = (kpiRecord: IKPIRecord, userId: string): boolean => {
  // Chỉ chủ sở hữu và KPI ở trạng thái draft hoặc rejected mới được sửa
  return kpiRecord.employeeId === userId && 
         (kpiRecord.status === 'draft' || kpiRecord.status === 'rejected');
};

/**
 * Check if KPI can be submitted
 */
export const canSubmitKPI = (kpiRecord: IKPIRecord, userId: string): boolean => {
  return kpiRecord.employeeId === userId && 
         kpiRecord.status === 'draft' &&
         kpiRecord.targets.length > 0;
};

/**
 * Check if adjustment can be requested
 */
export const canRequestAdjustment = (kpiRecord: IKPIRecord): boolean => {
  return kpiRecord.status === 'in_progress';
};

/**
 * Get escalation manager (for 48h timeout)
 */
export const getEscalationManager = (currentApproverRole: UserRole): UserRole | null => {
  switch (currentApproverRole) {
    case 'tl':
      return 'gl';
    case 'gl':
      return 'ceo';
    default:
      return null;
  }
};

/**
 * Check if user can delegate approval
 */
export const canDelegate = (userRole: UserRole): boolean => {
  return userRole === 'tl' || userRole === 'gl' || userRole === 'ceo';
};

/**
 * Check if KPI can be frozen (for offboarding)
 */
export const canFreezeKPI = (userRole: UserRole): boolean => {
  return userRole === 'tl' || userRole === 'gl' || userRole === 'ceo';
};
