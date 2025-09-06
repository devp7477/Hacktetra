import { apiRequest } from './queryClient';

// API base URL - should match your backend server
const API_BASE_URL = 'http://localhost:5001/api';

// Project API calls
export const projectsApi = {
  getAll: async () => {
    const res = await apiRequest('GET', `${API_BASE_URL}/projects`);
    return res.json();
  },
  
  getById: async (id: string) => {
    const res = await apiRequest('GET', `${API_BASE_URL}/projects/${id}`);
    return res.json();
  },
  
  create: async (data: any) => {
    const res = await apiRequest('POST', `${API_BASE_URL}/projects`, data);
    return res.json();
  },
  
  update: async (id: string, data: any) => {
    const res = await apiRequest('PUT', `${API_BASE_URL}/projects/${id}`, data);
    return res.json();
  },
  
  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `${API_BASE_URL}/projects/${id}`);
    return res.json();
  }
};

// Task API calls
export const tasksApi = {
  getAll: async (projectId?: string) => {
    const url = projectId 
      ? `${API_BASE_URL}/projects/${projectId}/tasks` 
      : `${API_BASE_URL}/tasks`;
    const res = await apiRequest('GET', url);
    return res.json();
  },
  
  getById: async (id: string) => {
    const res = await apiRequest('GET', `${API_BASE_URL}/tasks/${id}`);
    return res.json();
  },
  
  create: async (data: any) => {
    const res = await apiRequest('POST', `${API_BASE_URL}/tasks`, data);
    return res.json();
  },
  
  update: async (id: string, data: any) => {
    const res = await apiRequest('PUT', `${API_BASE_URL}/tasks/${id}`, data);
    return res.json();
  },
  
  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `${API_BASE_URL}/tasks/${id}`);
    return res.json();
  }
};

// User API calls
export const usersApi = {
  getCurrent: async () => {
    const res = await apiRequest('GET', `${API_BASE_URL}/users/me`);
    return res.json();
  },
  
  getById: async (id: string) => {
    const res = await apiRequest('GET', `${API_BASE_URL}/users/${id}`);
    return res.json();
  },
  
  update: async (id: string, data: any) => {
    const res = await apiRequest('PUT', `${API_BASE_URL}/users/${id}`, data);
    return res.json();
  }
};

// Chat API calls
export const chatApi = {
  getMessages: async (projectId: string) => {
    const res = await apiRequest('GET', `${API_BASE_URL}/projects/${projectId}/messages`);
    return res.json();
  },
  
  sendMessage: async (projectId: string, content: string) => {
    const res = await apiRequest('POST', `${API_BASE_URL}/projects/${projectId}/messages`, { content });
    return res.json();
  }
};

// Authentication API calls
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiRequest('POST', `${API_BASE_URL}/auth/login`, { email, password });
    return res.json();
  },
  
  register: async (userData: any) => {
    const res = await apiRequest('POST', `${API_BASE_URL}/auth/register`, userData);
    return res.json();
  },
  
  logout: async () => {
    const res = await apiRequest('POST', `${API_BASE_URL}/auth/logout`);
    return res.json();
  },
  
  getCurrentUser: async () => {
    const res = await apiRequest('GET', `${API_BASE_URL}/auth/me`);
    return res.json();
  }
};
