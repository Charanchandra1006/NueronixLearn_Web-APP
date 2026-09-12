/// <reference types="vite/client" />

import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 120000  // 120s — AI video generation can take time
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {}, { timeout: 15000 });
          const newToken = res.data.token;
          localStorage.setItem('token', newToken);
          processQueue(null);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    }
    
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { 
    name: string; 
    email: string; 
    password: string; 
    role?: string; 
    phone?: string;
    learningPace?: 'slow' | 'moderate' | 'fast';
    experienceLevel?: 'beginner' | 'intermediate' | 'professional';
    subjects?: string[];
  }) => 
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updateAvatar: (avatar: string) => api.put('/auth/avatar', { avatar }),
  completeOnboarding: (data: any) => api.put('/auth/complete-onboarding', data),
  sendOTP: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOTPRegister: (data: { email: string; otp: string; name: string; password: string; role: string; phone?: string }) =>
    api.post('/auth/verify-otp-register', data),
  sendLoginOTP: (email: string) => api.post('/auth/send-login-otp', { email }),
  verifyOTPLogin: (email: string, otp: string) => api.post('/auth/verify-otp-login', { email, otp }),
  updatePhone: (phone: string) => api.put('/auth/phone', { phone })
};

export const coursesAPI = {
  getAll: (params?: { category?: string; difficulty?: string; search?: string; page?: number; sort?: string }) =>
    api.get('/courses', { params }),
  getFeatured: () => api.get('/courses/featured'),
  getCategories: () => api.get('/courses/categories'),
  getMyCourses: () => api.get('/courses/my-courses'),
  getTeacherCourses: () => api.get('/courses/teacher'),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
  review: (id: string, data: any) => api.post(`/courses/${id}/review`, data)
};

export const learningAPI = {
  getNextModule: (courseId: string) => api.get(`/learn/next/${courseId}`),
  updateProgress: (data: { courseId: string; moduleId: string; completed?: boolean; timeSpent?: number }) =>
    api.post('/learn/progress', data),
  submitAnswer: (data: { courseId: string; assessmentId: string; questionId: string; answer: string }) =>
    api.post('/learn/submit-answer', data),
  getProgress: (courseId: string) => api.get(`/learn/progress/${courseId}`)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPerformance: () => api.get('/analytics/performance'),
  getCognitiveLoad: () => api.get('/analytics/cognitive-load'),
  getDailyProgress: () => api.get('/analytics/daily-progress')
};

export const mlAPI = {
  getRecommendations: () => api.get('/ml/recommendations'),
  submitFeedback: (data: { feedback: string; type: string; courseId?: string }) =>
    api.post('/ml/feedback', data),
  getIntent: () => api.get('/ml/intent'),
  getCognitivePattern: (courseId: string) => api.get(`/ml/cognitive-pattern?courseId=${courseId}`),
  getDifficultySuggestion: (loadLevel: number) => api.get(`/ml/difficulty-suggestion?loadLevel=${loadLevel}`),
  analyzeResponse: (data: { response: string; question?: string }) =>
    api.post('/ml/analyze-response', data),
  updateCognitiveLoad: (data: { courseId: string; metrics: any }) =>
    api.post('/ml/cognitive-load', data),
  uploadPDF: (file: File, subject: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subject', subject);
    return api.post('/ml/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const examsAPI = {
  getAll: () => api.get('/exams'),
  getById: (id: string) => api.get(`/exams/${id}`),
  create: (data: any) => api.post('/exams', data),
  update: (id: string, data: any) => api.put(`/exams/${id}`, data),
  publish: (id: string) => api.post(`/exams/${id}/publish`),
  start: (id: string) => api.post(`/exams/${id}/start`),
  submit: (id: string, data: any) => api.post(`/exams/${id}/submit`, data),
  getResults: (id: string) => api.get(`/exams/${id}/results`)
};

export const diaryAPI = {
  getEntries: (params?: any) => api.get('/diary/entries', { params }),
  getEntry: (id: string) => api.get(`/diary/entries/${id}`),
  createEntry: (data: any) => api.post('/diary/entries', data),
  updateEntry: (id: string, data: any) => api.put(`/diary/entries/${id}`, data),
  deleteEntry: (id: string) => api.delete(`/diary/entries/${id}`),
  lock: (password: string) => api.post('/diary/lock', { password }),
  unlock: (password: string) => api.post('/diary/unlock', { password }),
  getStatus: () => api.get('/diary/status'),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/diary/change-password', { currentPassword, newPassword })
};

export const chatbotAPI = {
  getGreeting: () => api.get('/chatbot/greeting'),
  chat: (message: string) => api.post('/chatbot/chat', { message }),
  getSuggestion: () => api.get('/chatbot/suggestion'),
  getContext: () => api.get('/chatbot/context'),
  clearContext: () => api.post('/chatbot/clear-context'),
  getWeakTopics: () => api.get('/chatbot/weak-topics'),
  addWeakTopic: (topic: string, subject: string) => api.post('/chatbot/add-weak-topic', { topic, subject }),
  updateWeakTopic: (id: string, completed: boolean) => api.put(`/chatbot/weak-topics/${id}`, { completed }),
  deleteWeakTopic: (id: string) => api.delete(`/chatbot/weak-topics/${id}`),
  getWeakTopicVideos: (id: string) => api.get(`/chatbot/weak-topics/${id}/videos`),
  generateTodo: (id: string) => api.post(`/chatbot/weak-topics/${id}/generate-todo`, {}),
  getTodos: () => api.get('/chatbot/todos'),
  completeTodo: (id: string) => api.put(`/chatbot/todos/${id}/complete`, {}),
  getNextVideo: () => api.get('/chatbot/next-video')
};

export const topicsAPI = {
  addSubject: (subject: string) => api.post('/topics/add-subject', { subject }),
  getSubjects: () => api.get('/topics/subjects'),
  getRoadmap: (subject: string) => api.get(`/topics/roadmap/${subject}`),
  completeTopic: (subject: string, topicTitle: string) => 
    api.post('/topics/complete-topic', { subject, topicTitle }),
  completeSubtopic: (subject: string, topicTitle: string, subtopicTitle: string) =>
    api.post('/topics/complete-subtopic', { subject, topicTitle, subtopicTitle }),
  getNextTopic: (subject: string) => api.get(`/topics/next/${subject}`),
  getSubtopics: (subject: string, topicTitle: string) => api.get(`/topics/subtopics/${subject}/${encodeURIComponent(topicTitle)}`),
  getSubtopicResources: (subject: string, topicTitle: string, subtopicTitle: string) => 
    api.get(`/topics/resources/subtopic/${encodeURIComponent(subject)}/${encodeURIComponent(topicTitle)}/${encodeURIComponent(subtopicTitle)}`),
  getResources: (subject: string, topic: string, type?: string) => 
    api.get(`/topics/resources/${subject}/${topic}`, { params: { type } }),
  deleteSubject: (id: string) => api.delete(`/topics/subject/${id}`),
  initializeFromWeakAreas: () => api.post('/topics/initialize-from-weak-areas', {})
};

export const adminAPI = {
  login: (username: string, password: string) => api.post('/admin/login', { username, password }),
  listAdmins: () => api.get('/admin/list'),
  addAdmin: (data: { username: string; password: string; email: string; isSuperAdmin?: boolean; permissions?: {
    manageUsers: boolean;
    manageCourses: boolean;
    manageExams: boolean;
    manageAdmins: boolean;
    viewAnalytics: boolean;
    manageContent: boolean;
  } }) => 
    api.post('/admin/add', data),
  removeAdmin: (id: string) => api.delete(`/admin/${id}`),
  
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  
  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  updateUser: (id: string, data: { name?: string; email?: string; role?: string }) => api.put(`/admin/users/${id}`, data),
  blockUser: (id: string, blocked: boolean) => api.put(`/admin/users/${id}/block`, { blocked }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  // Courses
  getCourses: (params?: any) => api.get('/admin/courses', { params }),
  getCourse: (id: string) => api.get(`/admin/courses/${id}`),
  updateCourseFeatured: (id: string, featured: boolean) => api.put(`/admin/courses/${id}/featured`, { featured }),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
  
  // Exams
  getExams: (params?: any) => api.get('/admin/exams', { params }),
  deleteExam: (id: string) => api.delete(`/admin/exams/${id}`),
  
  // Analytics
  getAnalytics: (days?: number) => api.get('/admin/analytics', { params: { days } })
};

export const aiAPI = {
  getRecommendation: () => api.get('/ai/recommendation'),
  getProfile: () => api.get('/ai/profile'),
  updateProfile: (data: { learningPace?: string; experienceLevel?: string; subjects?: string[]; strongTopics?: string[]; weakTopics?: string[] }) => 
    api.put('/ai/profile', data),
  updateTopicProgress: (data: { subject: string; topic: string; timeSpent?: number; quizScore?: number; attempts?: number; completed?: boolean }) =>
    api.post('/ai/topic-progress', data),
  getLearningTwin: () => api.get('/ai/learning-twin'),
  generateSlides: (topic: string, subject: string) => api.post('/ai-media/generate-slides', { topic, subject }),
  generateDiagram: (topic: string, subject: string) => api.get(`/ai-media/diagram/${encodeURIComponent(topic)}/${encodeURIComponent(subject)}`),
  generateVideo: (topic: string, subject: string, subtopic?: string) => api.post('/ai-media/generate-video', { topic, subject, subtopic })
};

export default api;
