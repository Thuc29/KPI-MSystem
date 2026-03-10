import type { KPIStatus, UserRole, TaskStatus } from '../models';

// API Base URL
export const API_BASE_URL = 'https://localhost:44348/api/v1';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_NAME: 'user',
  USER_ID: 'userId',
  USER_ROLE: 'role',
  DEPARTMENT: 'department',
} as const;

// Status Labels
export const STATUS_LABELS: Record<KPIStatus, string> = {
  draft: 'Bản nháp',
  pending_approval: 'Chờ duyệt',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
};

// Status Colors
export const STATUS_COLORS: Record<KPIStatus, string> = {
  draft: 'default',
  pending_approval: 'warning',
  in_progress: 'processing',
  completed: 'success',
  rejected: 'error',
};

// Role Labels
export const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Nhân viên',
  tl: 'Team Leader',
  gl: 'Group Leader',
  ceo: 'Giám đốc',
};

// Approval Steps
export const APPROVAL_STEPS = [
  { title: 'Nhân viên', description: 'Tạo hồ sơ' },
  { title: 'Quản lý', description: 'Phê duyệt' },
  { title: 'Thực thi', description: 'Cập nhật tiến độ' },
  { title: 'Hoàn thành', description: 'Nghiệm thu' },
];

// Status to Step Mapping
export const STATUS_TO_STEP: Record<KPIStatus, number> = {
  draft: 0,
  pending_approval: 1,
  in_progress: 2,
  completed: 3,
  rejected: 0,
};

// Task Status Labels
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  to_do: 'Cần làm',
  pending_verify: 'Chờ xác nhận',
  verified: 'Hoàn tất',
  overdue: 'Quá hạn',
};

// Task Status Colors
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  to_do: 'default',
  pending_verify: 'warning',
  verified: 'success',
  overdue: 'error',
};

// Export menu configuration
export * from './menuConfig';
