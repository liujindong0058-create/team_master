import axios from 'axios';
import type { User, Team, Member, Note, Assessment, Task } from '../types';

const API_BASE_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post('/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.user;
  },
};

export const teamAPI = {
  create: async (name: string, description?: string): Promise<Team> => {
    const response = await axiosInstance.post('/teams', { name, description });
    return response.data.team;
  },
  getAll: async (): Promise<Team[]> => {
    const response = await axiosInstance.get('/teams');
    return response.data.teams;
  },
  getById: async (id: string): Promise<Team> => {
    const response = await axiosInstance.get(`/teams/${id}`);
    return response.data.team;
  },
  update: async (id: string, name: string, description?: string): Promise<Team> => {
    const response = await axiosInstance.put(`/teams/${id}`, { name, description });
    return response.data.team;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(`/teams/${id}`);
  },
};

export const memberAPI = {
  add: async (teamId: string, name: string, position?: string, strengths?: string, weaknesses?: string, tags?: string, futureDirection?: string): Promise<Member> => {
    const response = await axiosInstance.post(`/members/${teamId}/members`, { name, position, strengths, weaknesses, tags, futureDirection });
    return response.data.member;
  },
  getByTeam: async (teamId: string): Promise<Member[]> => {
    const response = await axiosInstance.get(`/members/${teamId}/members`);
    return response.data.members;
  },
  getById: async (id: string): Promise<Member> => {
    const response = await axiosInstance.get(`/members/${id}`);
    return response.data.member;
  },
  update: async (id: string, name: string, position?: string, strengths?: string, weaknesses?: string, tags?: string, futureDirection?: string): Promise<Member> => {
    const response = await axiosInstance.put(`/members/${id}`, { name, position, strengths, weaknesses, tags, futureDirection });
    return response.data.member;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(`/members/${id}`);
  },
};

export const noteAPI = {
  add: async (memberId: string, content: string, type?: string, privacy?: string, images?: string[]): Promise<Note> => {
    const response = await axiosInstance.post(`/notes/${memberId}`, { content, type, privacy, images });
    return response.data.note;
  },
  getByMember: async (memberId: string): Promise<Note[]> => {
    const response = await axiosInstance.get(`/notes/${memberId}`);
    return response.data.notes;
  },
  getTimeline: async (teamId: string): Promise<Note[]> => {
    const response = await axiosInstance.get(`/notes/timeline?teamId=${teamId}`);
    return response.data.timeline;
  },
  update: async (id: string, content: string, type?: string, privacy?: string): Promise<Note> => {
    const response = await axiosInstance.put(`/notes/${id}`, { content, type, privacy });
    return response.data.note;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(`/notes/${id}`);
  },
};

export const assessmentAPI = {
  create: async (memberId: string, dimensions: Assessment['dimensions'], comment?: string): Promise<Assessment> => {
    const response = await axiosInstance.post(`/assessments/${memberId}`, { dimensions, comment });
    return response.data.assessment;
  },
  getByMember: async (memberId: string): Promise<Assessment[]> => {
    const response = await axiosInstance.get(`/assessments/${memberId}`);
    return response.data.assessments;
  },
  update: async (id: string, dimensions: Assessment['dimensions'], comment?: string): Promise<Assessment> => {
    const response = await axiosInstance.put(`/assessments/${id}`, { dimensions, comment });
    return response.data.assessment;
  },
};

export const taskAPI = {
  create: async (teamId: string, title: string, description?: string, requiredDimensions?: Record<string, number>, priority?: string): Promise<Task> => {
    const response = await axiosInstance.post(`/tasks/${teamId}`, { title, description, requiredDimensions, priority });
    return response.data.task;
  },
  getByTeam: async (teamId: string): Promise<Task[]> => {
    const response = await axiosInstance.get(`/tasks/${teamId}`);
    return response.data.tasks;
  },
  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await axiosInstance.put(`/tasks/${id}`, updates);
    return response.data.task;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(`/tasks/${id}`);
  },
  recommendMembers: async (teamId: string, requiredDimensions: Record<string, number>): Promise<Member[]> => {
    const response = await axiosInstance.post(`/tasks/${teamId}/recommend`, { requiredDimensions });
    return response.data.recommended;
  },
};