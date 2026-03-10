import axios from './axios';
import { mockAuthApi, mockKpiApi } from './mockApi';
import { mockTaskApi } from './taskApi';
import type { IBackendRes, IKPIRecord, IApprovalHistory, IUser, ITaskItem, ITaskFormValues, ITaskEvidenceFormValues, ITaskExtensionRequest, ITaskAppeal, ITaskAdjustmentRequest } from '../../core/models';

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

// Task APIs
export const taskApi = USE_MOCK_API ? mockTaskApi : {
  getTasksByTarget: (targetId: string) => {
    return axios.get<IBackendRes<ITaskItem[]>>(`/tasks/target/${targetId}`);
  },
  
  createTask: (targetId: string, taskData: ITaskFormValues) => {
    return axios.post<IBackendRes<ITaskItem>>(`/tasks/target/${targetId}`, taskData);
  },
  
  updateTask: (taskId: string, taskData: Partial<ITaskItem>) => {
    return axios.put<IBackendRes<ITaskItem>>(`/tasks/${taskId}`, taskData);
  },
  
  submitTaskCompletion: (taskId: string, evidence: ITaskEvidenceFormValues) => {
    return axios.post<IBackendRes<ITaskItem>>(`/tasks/${taskId}/complete`, evidence);
  },
  
  verifyTask: (taskId: string, verifierId: string) => {
    return axios.post<IBackendRes<ITaskItem>>(`/tasks/${taskId}/verify`, { verifierId });
  },
  
  rejectTask: (taskId: string, rejectorId: string, reason: string) => {
    return axios.post<IBackendRes<ITaskItem>>(`/tasks/${taskId}/reject`, { rejectorId, reason });
  },
  
  requestExtension: (request: ITaskExtensionRequest) => {
    return axios.post<IBackendRes<ITaskItem>>(`/tasks/${request.taskId}/extension`, request);
  },
  
  approveExtension: (taskId: string) => {
    return axios.post<IBackendRes<ITaskItem>>(`/tasks/${taskId}/extension/approve`);
  },
  
  appealTask: (appeal: ITaskAppeal) => {
    return axios.post<IBackendRes<ITaskItem>>(`/tasks/${appeal.taskId}/appeal`, appeal);
  },
  
  requestAdjustment: (request: ITaskAdjustmentRequest) => {
    return axios.post<IBackendRes<any>>('/tasks/adjustment', request);
  },
  
  deleteTask: (taskId: string) => {
    return axios.delete<IBackendRes<null>>(`/tasks/${taskId}`);
  },
};
