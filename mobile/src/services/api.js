import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://cloud-school-erp-1-wazfrith.replit.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const tenantId = await AsyncStorage.getItem('tenant_id');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
};

export const quizAPI = {
  getQuizzes: () => api.get('/quiz'),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  submitQuiz: (id, answers) => api.post(`/quiz/${id}/submit`, { answers }),
};

export const summaryAPI = {
  getSummaries: (params) => api.get('/ai/summaries', { params }),
  generateSummary: (data) => api.post('/ai/summaries/generate', data),
};

export const notesAPI = {
  getNotes: (params) => api.get('/ai/notes', { params }),
  generateNotes: (data) => api.post('/ai/notes/generate', data),
};

export const assistantAPI = {
  chat: (message) => api.post('/ai/assistant/chat', { message }),
};

export default api;
