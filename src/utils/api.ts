import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const API_BASE_URL = `${API_BASE}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
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

// Admin Passer APIs
export const adminPasserAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/passers', { params }),

  getOne: (id: string) => api.get(`/admin/passers/${id}`),

  create: (data: { title: string; thumbnailUrl: string; imageUrls?: string[] }) =>
    api.post('/admin/passers', data),

  update: (id: string, data: { title?: string; thumbnailUrl?: string; imageUrls?: string[] }) =>
    api.patch(`/admin/passers/${id}`, data),

  delete: (id: string) => api.delete(`/admin/passers/${id}`),

  getDeleted: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/passers/deleted/list', { params }),

  restore: (id: string) => api.post(`/admin/passers/${id}/restore`),

  permanentDelete: (id: string) => api.delete(`/admin/passers/${id}/permanent`),

  bulkDelete: (ids: string[]) => api.post('/admin/passers/bulk-delete', { ids }),

  bulkRestore: (ids: string[]) => api.post('/admin/passers/bulk-restore', { ids }),

  bulkPermanentDelete: (ids: string[]) =>
    api.post('/admin/passers/bulk-permanent-delete', { ids }),
};

// Admin Notice APIs
export const adminNoticeAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/notices', { params }),

  getOne: (id: string) => api.get(`/admin/notices/${id}`),

  create: (data: { title: string; content: string; thumbnailUrl?: string }) =>
    api.post('/admin/notices', data),

  update: (id: string, data: { title?: string; content?: string; thumbnailUrl?: string }) =>
    api.patch(`/admin/notices/${id}`, data),

  delete: (id: string) => api.delete(`/admin/notices/${id}`),

  getDeleted: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/notices/deleted/list', { params }),

  restore: (id: string) => api.post(`/admin/notices/${id}/restore`),

  permanentDelete: (id: string) => api.delete(`/admin/notices/${id}/permanent`),

  bulkDelete: (ids: string[]) => api.post('/admin/notices/bulk-delete', { ids }),

  bulkRestore: (ids: string[]) => api.post('/admin/notices/bulk-restore', { ids }),

  bulkPermanentDelete: (ids: string[]) =>
    api.post('/admin/notices/bulk-permanent-delete', { ids }),
};

// Admin Resource APIs
export const adminResourceAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/resources', { params }),

  getOne: (id: string) => api.get(`/admin/resources/${id}`),

  create: (data: { title: string; content: string; thumbnailUrl?: string }) =>
    api.post('/admin/resources', data),

  update: (id: string, data: { title?: string; content?: string; thumbnailUrl?: string }) =>
    api.patch(`/admin/resources/${id}`, data),

  delete: (id: string) => api.delete(`/admin/resources/${id}`),

  getDeleted: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/resources/deleted/list', { params }),

  restore: (id: string) => api.post(`/admin/resources/${id}/restore`),

  permanentDelete: (id: string) => api.delete(`/admin/resources/${id}/permanent`),

  bulkDelete: (ids: string[]) => api.post('/admin/resources/bulk-delete', { ids }),

  bulkRestore: (ids: string[]) => api.post('/admin/resources/bulk-restore', { ids }),

  bulkPermanentDelete: (ids: string[]) =>
    api.post('/admin/resources/bulk-permanent-delete', { ids }),
};

// Admin Gallery APIs
export const adminGalleryAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/galleries', { params }),

  getOne: (id: string) => api.get(`/admin/galleries/${id}`),

  create: (data: { title: string; imageUrl: string }) =>
    api.post('/admin/galleries', data),

  update: (id: string, data: { title?: string; imageUrl?: string }) =>
    api.patch(`/admin/galleries/${id}`, data),

  delete: (id: string) => api.delete(`/admin/galleries/${id}`),

  getDeleted: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/galleries/deleted/list', { params }),

  restore: (id: string) => api.post(`/admin/galleries/${id}/restore`),

  permanentDelete: (id: string) => api.delete(`/admin/galleries/${id}/permanent`),

  bulkDelete: (ids: string[]) => api.post('/admin/galleries/bulk-delete', { ids }),

  bulkRestore: (ids: string[]) => api.post('/admin/galleries/bulk-restore', { ids }),

  bulkPermanentDelete: (ids: string[]) =>
    api.post('/admin/galleries/bulk-permanent-delete', { ids }),
};

// Admin Content APIs
export const adminContentAPI = {
  getAll: () => api.get('/admin/content'),

  updateHero: (data: {
    imageUrls?: string[];
    subtitle?: string;
    title?: string;
    buttonText?: string;
    buttonLink?: string;
  }) => api.put('/admin/content/hero', data),

  updateSchoolPassers: (schoolPassers: Array<{
    thumbnailUrl: string;
    school: string;
    count: number;
    link: string;
    order?: number;
  }>) => api.put('/admin/content/school-passers', { schoolPassers }),

  updateYoutubeVideos: (youtubeVideos: Array<{
    thumbnailUrl: string;
    title: string;
    description: string;
    link: string;
    order?: number;
  }>) => api.put('/admin/content/youtube-videos', { youtubeVideos }),

  updateInstructors: (instructors: Array<{
    imageUrl: string;
    name: string;
    description: string;
    link: string;
    order?: number;
  }>) => api.put('/admin/content/instructors', { instructors }),

  updateInstagramPosts: (instagramPosts: Array<{
    imageUrl: string;
    title: string;
    link: string;
    order?: number;
  }>) => api.put('/admin/content/instagram-posts', { instagramPosts }),

  updateHistoryPassers: (historyPassers: Array<{
    leftText: string;
    rightText: string;
    order?: number;
  }>) => api.put('/admin/content/history-passers', { historyPassers }),
};

// Image upload API
export const imageAPI = {
  upload: (file: File, folder: string = 'passers') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files: File[], folder: string = 'passers') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);
    return api.post('/images/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
