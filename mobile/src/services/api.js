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
  getSections: (classId) => api.get(`/sections${classId ? `?class_id=${classId}` : ''}`),
  getSubjects: () => api.get('/subjects'),
  getSubjectsByClass: (classStandard) => api.get(`/subjects/by-class/${classStandard}`),
};

export const studentsAPI = {
  getStudents: (params) => api.get('/students', { params }),
  getStudent: (id) => api.get(`/students/${id}`),
  getStudentCount: () => api.get('/students/count'),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

export const staffAPI = {
  getStaff: (params) => api.get('/staff', { params }),
  getStaffMember: (id) => api.get(`/staff/${id}`),
  getStaffCount: () => api.get('/staff/count'),
  createStaff: (data) => api.post('/staff', data),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
};

export const timetableAPI = {
  getTimetables: (params) => api.get('/timetables', { params }),
  getTimetable: (id) => api.get(`/timetables/${id}`),
  getMyTimetable: () => api.get('/timetables/my'),
};

export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  getEvent: (id) => api.get(`/calendar/events/${id}`),
};

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const testsAPI = {
  getTests: (params) => api.get('/tests', { params }),
  getTest: (id) => api.get(`/tests/${id}`),
  generateTest: (data) => api.post('/ai/test/generate', data),
};

export const quizAPI = {
  generateQuiz: (data) => api.post('/quiz/generate', data),
  submitQuiz: (data) => api.post('/quiz/submit', data),
  getQuizResults: (studentId) => api.get(`/quiz/results/${studentId}`),
  getQuizProgress: (studentId) => api.get(`/quiz/progress/${studentId}`),
};

export const summaryAPI = {
  getSummaries: (params) => api.get('/ai/summary/list', { params }),
  generateSummary: (data) => api.post('/ai/summary/generate', data),
};

export const notesAPI = {
  getNotes: (params) => api.get('/ai/notes/list', { params }),
  generateNotes: (data) => api.post('/ai/notes/generate', data),
};

export const assistantAPI = {
  chat: (data) => api.post('/ai-engine/chat', data),
};

export const attendanceAPI = {
  getAttendance: (params) => api.get('/attendance', { params }),
  getMyAttendance: () => api.get('/attendance/my'),
};

export const dashboardAPI = {
  getAnalytics: (params) => api.get('/gini/usage/analytics', { params }),
  getStats: () => api.get('/dashboard/stats'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const resultsAPI = {
  getExamTerms: () => api.get('/exam-terms'),
  getStudentResults: (params) => api.get('/student-results', { params }),
  getClassResults: (params) => api.get('/class-results', { params }),
  getMyResults: () => api.get('/my-results'),
  getMarkEntryTemplate: (params) => api.get('/mark-entry/template', { params }),
  saveMarks: (data) => api.post('/marks', data),
};

export const feesAPI = {
  getFeesSummary: () => api.get('/fees/dashboard'),
  getMyFees: () => api.get('/fees/student-fees'),
  getStudentFees: (studentId) => api.get(`/fees/student/${studentId}`),
  getFeeHistory: (params) => api.get('/fees/payments', { params }),
  getFeeDue: () => api.get('/fees/student-fees'),
  getFeeStructure: () => api.get('/fees/configurations'),
};

export const certificatesAPI = {
  getCertificates: () => api.get('/certificates/dashboard'),
  getMyCertificates: () => api.get('/certificates/dashboard'),
  downloadCertificate: (id) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
  getCertificateTypes: () => api.get('/certificates/dashboard'),
};

export const academicCMSAPI = {
  getBooks: (params) => api.get('/academic-books', { params }),
  getBook: (id) => api.get(`/academic-books/${id}`),
  getReferenceBooks: (params) => api.get('/reference-books', { params }),
  getPreviousPapers: (params) => api.get('/previous-year-papers', { params }),
  getQnA: (params) => api.get('/qna-questions', { params }),
};

export const reportsAPI = {
  getAttendanceReport: (params) => api.get('/reports/attendance/monthly-summary', { params }),
  getFeeReport: (params) => api.get('/fees/dashboard', { params }),
  getStudentReport: (studentId) => api.get('/reports/student-information', { params: { student_id: studentId } }),
};

export const vehicleAPI = {
  getVehicles: () => api.get('/vehicles'),
  getRoutes: () => api.get('/vehicle-routes'),
  getMyTransport: () => api.get('/transport/assignment'),
};

export const settingsAPI = {
  getInstitutionSettings: () => api.get('/institution'),
  getAcademicPeriods: () => api.get('/academic-periods'),
  updateNotificationPrefs: (data) => api.put('/notification-preferences', data),
};

export default api;
