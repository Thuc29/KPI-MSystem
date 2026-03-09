import { STORAGE_KEYS } from '../../core/constants';
import type { UserRole } from '../../core/models';

export const storage = {
  // Token
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  // User Info
  getUserName: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME);
  },
  setUserName: (name: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  getUserId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  },
  setUserId: (id: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, id);
  },

  getUserRole: (): UserRole | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole | null;
  },
  setUserRole: (role: UserRole): void => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  },

  getDepartment: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.DEPARTMENT);
  },
  setDepartment: (department: string): void => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENT, department);
  },

  // Clear all
  clearAll: (): void => {
    localStorage.clear();
  },
};
