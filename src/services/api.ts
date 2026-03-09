import axios from './axios';
import { mockAuthApi, mockKpiApi } from './mockApi';
import type { IBackendRes, IKPIRecord, IApprovalHistory, IUser } from '../types';

// Toggle between mock and real API
const USE_MOCK_API = true; // Set to false to use real API

// Auth APIs
export const authApi = USE_MOCK_API ? mockAuthApi : {
  login: (username: string, password: string) => {
    return axios.post<IBackendRes<IUser>>('/auth/login', { username, password });
  },
  
  getCurrentUser: () => {
    return axios.get<IBackendRes<IUser>>('/auth/me');
  },
  
  logout: () => {
    return axios.post<IBackendRes<null>>('/auth/logout');
  },
};

// KPI APIs
export const kpiApi = USE_MOCK_API ? mockKpiApi : {
  getList: () => {
    return axios.get<IBackendRes<IKPIRecord[]>>('/kpi/list');
  },
  
  getById: (id: string) => {
    return axios.get<IBackendRes<IKPIRecord>>(`/kpi/${id}`);
  },
  
  create: (data: Partial<IKPIRecord>) => {
    return axios.post<IBackendRes<IKPIRecord>>('/kpi/create', data);
  },
  
  update: (id: string, data: Partial<IKPIRecord>) => {
    return axios.put<IBackendRes<IKPIRecord>>(`/kpi/${id}`, data);
  },
  
  submit: (id: string) => {
    return axios.post<IBackendRes<IKPIRecord>>(`/kpi/${id}/submit`);
  },
  
  approve: (id: string, comment?: string) => {
    return axios.post<IBackendRes<IKPIRecord>>(`/kpi/${id}/approve`, { comment });
  },
  
  reject: (id: string, reason: string) => {
    return axios.post<IBackendRes<IKPIRecord>>(`/kpi/${id}/reject`, { reason });
  },
  
  getHistory: (kpiId: string) => {
    return axios.get<IBackendRes<IApprovalHistory[]>>(`/kpi/${kpiId}/history`);
  },
};
