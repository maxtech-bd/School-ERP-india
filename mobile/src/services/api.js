import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://fdfd5d5a-063f-4062-8935-758612b55565-00-2lwoa0f8du864.worf.replit.dev/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

export const classesAPI = {
  getClasses: () => api.get('/classes'),
  getSubjects: () => api.get('/subjects'),
};

export const quizAPI = {
  generateQuiz: (data) => api.post('/ai/quiz/generate', data),
  submitQuiz: (quizId, answers) => api.post(`/ai/quiz/${quizId}/submit`, { answers }),
  getQuizHistory: () => api.get('/ai/quiz/history'),
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
  chat: (data) => api.post('/ai/assistant/chat', data),
};

export const attendanceAPI = {
  getAttendance: (params) => api.get('/attendance', { params }),
  getMyAttendance: () => api.get('/attendance/my'),
};

export default api;
