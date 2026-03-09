import axios from 'axios';
import { API_BASE_URL } from '../../core/constants';
import { storage } from '../utils';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// Bộ chặn gửi đi kèm token trong header nếu có token trong localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bộ chặn để xử lý lỗi 401 Unauthorized và tự động chuyển hướng về trang đăng nhập
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Token hết hạn hoặc không hợp lệ!');
      storage.clearAll();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
