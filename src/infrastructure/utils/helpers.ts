import { STATUS_LABELS, STATUS_COLORS, ROLE_LABELS, STATUS_TO_STEP } from '../../core/constants';
import type { KPIStatus, UserRole, IKPITarget } from '../../core/models';

export const getStatusLabel = (status: KPIStatus): string => {
  return STATUS_LABELS[status] || status;
};

export const getStatusColor = (status: KPIStatus): string => {
  return STATUS_COLORS[status] || 'default';
};

export const getRoleLabel = (role: UserRole): string => {
  return ROLE_LABELS[role] || role;
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
