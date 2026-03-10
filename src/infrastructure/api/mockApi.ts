import type { IBackendRes, IKPIRecord, IUser } from '../../core/models';
import { mockUsers, mockKPIRecords, MOCK_PASSWORD } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for KPI records
let kpiRecords = [...mockKPIRecords];

export const mockAuthApi = {
  login: async (username: string, password: string): Promise<{ data: IBackendRes<IUser> }> => {
    await delay(500); // Simulate network delay

    const user = mockUsers.find(u => u.username === username);
    
    if (!user || password !== MOCK_PASSWORD) {
      throw {
        response: {
          data: {
            message: 'Tên đăng nhập hoặc mật khẩu không đúng',
            statusCode: 401,
          }
        }
      };
    }

    return {
      data: {
        message: 'Đăng nhập thành công',
        statusCode: 200,
        data: user,
      }
    };
  },

  getCurrentUser: async (): Promise<{ data: IBackendRes<IUser> }> => {
    await delay(300);
    
    // Get user from token (mock)
    const token = localStorage.getItem('access_token');
    const user = mockUsers.find(u => u.token === token);
    
    if (!user) {
      throw {
        response: {
          data: {
            message: 'Unauthorized',
            statusCode: 401,
          }
        }
      };
    }

    return {
      data: {
        message: 'Success',
        statusCode: 200,
        data: user,
      }
    };
  },

  logout: async (): Promise<{ data: IBackendRes<null> }> => {
    await delay(200);
    return {
      data: {
        message: 'Đăng xuất thành công',
        statusCode: 200,
        data: null,
      }
    };
  },
};

export const mockKpiApi = {
  getList: async (): Promise<{ data: IBackendRes<IKPIRecord[]> }> => {
    await delay(500);
    
    return {
      data: {
        message: 'Success',
        statusCode: 200,
        data: kpiRecords,
      }
    };
  },

  getById: async (id: string): Promise<{ data: IBackendRes<IKPIRecord> }> => {
    await delay(400);
    
    const kpi = kpiRecords.find(k => k.id === id);
    
    if (!kpi) {
      throw {
        response: {
          data: {
            message: 'Không tìm thấy hồ sơ KPI',
            statusCode: 404,
          }
        }
      };
    }

    return {
      data: {
        message: 'Success',
        statusCode: 200,
        data: kpi,
      }
    };
  },

  create: async (data: Partial<IKPIRecord>): Promise<{ data: IBackendRes<IKPIRecord> }> => {
    await delay(600);
    
    const newKPI: IKPIRecord = {
      id: `KPI-${data.year}-KI-${String(kpiRecords.length + 1).padStart(3, '0')}`,
      employeeId: data.employeeId || '',
      employeeName: data.employeeName || '',
      department: data.department || '',
      year: data.year || new Date().getFullYear(),
      status: 'draft',
      targets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    kpiRecords.push(newKPI);

    return {
      data: {
        message: 'Tạo hồ sơ KPI thành công',
        statusCode: 200,
        data: newKPI,
      }
    };
  },

  update: async (id: string, data: Partial<IKPIRecord>): Promise<{ data: IBackendRes<IKPIRecord> }> => {
    await delay(500);
    
    const index = kpiRecords.findIndex(k => k.id === id);
    
    if (index === -1) {
      throw {
        response: {
          data: {
            message: 'Không tìm thấy hồ sơ KPI',
            statusCode: 404,
          }
        }
      };
    }

    kpiRecords[index] = {
      ...kpiRecords[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: {
        message: 'Cập nhật thành công',
        statusCode: 200,
        data: kpiRecords[index],
      }
    };
  },

  submit: async (id: string): Promise<{ data: IBackendRes<IKPIRecord> }> => {
    await delay(500);
    
    const index = kpiRecords.findIndex(k => k.id === id);
    
    if (index === -1) {
      throw {
        response: {
          data: {
            message: 'Không tìm thấy hồ sơ KPI',
            statusCode: 404,
          }
        }
      };
    }

    kpiRecords[index] = {
      ...kpiRecords[index],
      status: 'pending_approval',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: {
        message: 'Gửi hồ sơ thành công',
        statusCode: 200,
        data: kpiRecords[index],
      }
    };
  },

  approve: async (id: string, comment?: string): Promise<{ data: IBackendRes<IKPIRecord> }> => {
    await delay(500);
    
    const index = kpiRecords.findIndex(k => k.id === id);
    
    if (index === -1) {
      throw {
        response: {
          data: {
            message: 'Không tìm thấy hồ sơ KPI',
            statusCode: 404,
          }
        }
      };
    }

    kpiRecords[index] = {
      ...kpiRecords[index],
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: {
        message: 'Phê duyệt thành công',
        statusCode: 200,
        data: kpiRecords[index],
      }
    };
  },

  reject: async (id: string, reason: string): Promise<{ data: IBackendRes<IKPIRecord> }> => {
    await delay(500);
    
    const index = kpiRecords.findIndex(k => k.id === id);
    
    if (index === -1) {
      throw {
        response: {
          data: {
            message: 'Không tìm thấy hồ sơ KPI',
            statusCode: 404,
          }
        }
      };
    }

    kpiRecords[index] = {
      ...kpiRecords[index],
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: {
        message: 'Đã từ chối hồ sơ',
        statusCode: 200,
        data: kpiRecords[index],
      }
    };
  },

  getHistory: async (kpiId: string): Promise<{ data: IBackendRes<any[]> }> => {
    await delay(400);
    
    return {
      data: {
        message: 'Success',
        statusCode: 200,
        data: [],
      }
    };
  },
};
