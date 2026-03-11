import type { KPIStatus, UserRole, IKPITarget } from '../../core/models';
import { STATUS_TO_STEP } from '../../core/constants';

// Get translation function - will be set by i18n context
let getTranslation: any = null;

export const setTranslationFunction = (fn: any) => {
  getTranslation = fn;
};

export const getStatusLabel = (status: KPIStatus): string => {
  if (!getTranslation) {
    // Fallback to Vietnamese if translation not available
    const fallback: Record<KPIStatus, string> = {
      draft: 'Bản nháp',
      pending_approval: 'Chờ duyệt',
      in_progress: 'Đang thực hiện',
      completed: 'Hoàn thành',
      rejected: 'Từ chối',
    };
    return fallback[status] || status;
  }
  
  const statusMap: Record<KPIStatus, string> = {
    draft: getTranslation().status.draft,
    pending_approval: getTranslation().status.pendingApproval,
    in_progress: getTranslation().status.inProgress,
    completed: getTranslation().status.completed,
    rejected: getTranslation().status.rejected,
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: KPIStatus): string => {
  const colors: Record<KPIStatus, string> = {
    draft: 'default',
    pending_approval: 'warning',
    in_progress: 'processing',
    completed: 'success',
    rejected: 'error',
  };
  return colors[status] || 'default';
};

export const getRoleLabel = (role: UserRole): string => {
  if (!getTranslation) {
    // Fallback to Vietnamese if translation not available
    const fallback: Record<UserRole, string> = {
      employee: 'Nhân viên',
      tl: 'Team Leader',
      gl: 'Group Leader',
      ceo: 'Giám đốc',
    };
    return fallback[role] || role;
  }
  
  const roleMap: Record<UserRole, string> = {
    employee: getTranslation().role.employee,
    tl: getTranslation().role.teamLeader,
    gl: getTranslation().role.groupLeader,
    ceo: getTranslation().role.ceo,
  };
  return roleMap[role] || role;
};

export const getCurrentStep = (status: KPIStatus): number => {
  return STATUS_TO_STEP[status] || 0;
};

export const calculateTotalWeight = (targets: IKPITarget[]): number => {
  return targets.reduce((sum, target) => sum + target.weight, 0);
};

export const isWeightValid = (targets: IKPITarget[]): boolean => {
  return calculateTotalWeight(targets) === 100;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
