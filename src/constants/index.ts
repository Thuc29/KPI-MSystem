import type { KPIStatus, UserRole } from '../types';

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
  pending_manager: 'Chờ Manager',
  pending_hr: 'Chờ HR',
  pending_ceo: 'Chờ CEO',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

// Status Colors
export const STATUS_COLORS: Record<KPIStatus, string> = {
  draft: 'default',
  pending_manager: 'processing',
  pending_hr: 'processing',
  pending_ceo: 'processing',
  approved: 'success',
  rejected: 'error',
};

// Role Labels
export const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Nhân viên',
  manager: 'Quản lý',
  hr: 'Nhân sự',
  ceo: 'Giám đốc',
};

// Approval Steps
export const APPROVAL_STEPS = [
  { title: 'Nhân viên', description: 'Tạo hồ sơ' },
  { title: 'Manager', description: 'Phê duyệt' },
  { title: 'HR', description: 'Kiểm định' },
  { title: 'CEO', description: 'Ký duyệt' },
  { title: 'Hoàn thành', description: 'Đã duyệt' },
];

// Status to Step Mapping
export const STATUS_TO_STEP: Record<KPIStatus, number> = {
  draft: 0,
  pending_manager: 1,
  pending_hr: 2,
  pending_ceo: 3,
  approved: 4,
  rejected: 0,
};

// Export menu configuration
export * from './menuConfig';
