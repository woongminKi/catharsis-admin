import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  setup: (data: { username: string; password: string; name: string }) =>
    api.post('/auth/setup', data),
};

// Admin Consultation APIs
export const adminConsultationAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    boardType?: string;
    searchType?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/consultations', { params }),

  getOne: (id: string) => api.get(`/admin/consultations/${id}`),

  update: (id: string, data: { title?: string; content?: string; isSecret?: boolean; status?: string }) =>
    api.patch(`/admin/consultations/${id}`, data),

  delete: (id: string) => api.delete(`/admin/consultations/${id}`),

  addComment: (id: string, content: string) =>
    api.post(`/admin/consultations/${id}/comments`, { content }),

  updateComment: (id: string, commentId: string, content: string) =>
    api.patch(`/admin/consultations/${id}/comments/${commentId}`, { content }),

  deleteComment: (id: string, commentId: string) =>
    api.delete(`/admin/consultations/${id}/comments/${commentId}`),

  getDeleted: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/consultations/deleted/list', { params }),

  restore: (id: string) => api.post(`/admin/consultations/${id}/restore`),

  permanentDelete: (id: string) => api.delete(`/admin/consultations/${id}/permanent`),

  bulkDelete: (ids: string[]) => api.post('/admin/consultations/bulk-delete', { ids }),

  bulkRestore: (ids: string[]) => api.post('/admin/consultations/bulk-restore', { ids }),

  bulkPermanentDelete: (ids: string[]) =>
    api.post('/admin/consultations/bulk-permanent-delete', { ids }),
};

export default api;
