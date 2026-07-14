import axios from 'axios';
import type { LoginForm, LoginResponse, InfoItem, SearchResult, Category, RegisterForm, Comment } from '../types';

const baseURL = '/api';

const apiClient = axios.create({
 baseURL,
 headers: {
 'Content-Type': 'application/json',
 },
});

apiClient.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

apiClient.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 window.location.href = '/login';
 }
 return Promise.reject(error);
 }
);

export interface CreateInfoForm {
 title: string;
 content: string;
 category: string;
 userId: number;
 isPrivate: boolean;
}

export interface CreateCommentForm {
 content: string;
 userId?: number;
 userName: string;
}

export interface AgentContext {
 infoId?: number;
 pageType?: string;
}

export interface AgentResponse {
  success: boolean;
  answer: string;
  interactionType?: string;
  type?: string;
  data?: any;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export const api = {
 login: async (form: LoginForm): Promise<LoginResponse> => {
 const response = await apiClient.post<LoginResponse>('/auth/login', form);
 return response.data;
 },
 register: async (form: RegisterForm): Promise<LoginResponse> => {
 const response = await apiClient.post<LoginResponse>('/auth/register', form);
 return response.data;
 },
 searchInfo: async (keyword: string, category?: string, page = 1, pageSize = 10, userId?: number, privacyFilter: 'all' | 'public' | 'private' = 'all'): Promise<SearchResult> => {
 const response = await apiClient.get<SearchResult>('/info/search', {
 params: { keyword, category, page, pageSize, userId, privacy: privacyFilter }
 });
 return response.data;
 },
 getCategories: async (): Promise<Category[]> => {
 const response = await apiClient.get<Category[]>('/info/categories');
 return response.data;
 },
 getInfoById: async (id: string, userId?: number): Promise<InfoItem | null> => {
 try {
 const response = await apiClient.get<InfoItem>(`/info/${id}`, {
 params: { userId }
 });
 return response.data;
 }
 catch (error) {
 return null;
 }
 },
 createInfo: async (form: CreateInfoForm): Promise<{ id: number }> => {
 const response = await apiClient.post<{ id: number }>('/info', form);
 return response.data;
 },
 updateInfo: async (id: number, form: CreateInfoForm): Promise<void> => {
 await apiClient.put(`/info/${id}`, form);
 },
 deleteInfo: async (id: number, userId: number): Promise<void> => {
 await apiClient.delete(`/info/${id}`, {
 params: { userId }
 });
 },
 getUserInfo: async (userId: number, page = 1, pageSize = 10): Promise<SearchResult> => {
 const response = await apiClient.get<SearchResult>(`/info/user/${userId}`, {
 params: { page, pageSize }
 });
 return response.data;
 },
 getComments: async (infoId: string): Promise<Comment[]> => {
 const response = await apiClient.get<Comment[]>(`/info/${infoId}/comments`);
 return response.data;
 },
 addComment: async (infoId: string, form: CreateCommentForm): Promise<{ id: number }> => {
 const response = await apiClient.post<{ id: number }>(`/info/${infoId}/comments`, form);
 return response.data;
 },
 deleteComment: async (commentId: number, userId: number): Promise<void> => {
 await apiClient.delete(`/info/comments/${commentId}`, {
 params: { userId }
 });
 },
 agentAsk: async (userId: number, question: string, context?: AgentContext, actionId?: string, confirm?: boolean): Promise<AgentResponse> => {
 const response = await apiClient.post<AgentResponse>('/agent/ask', {
 userId,
 question,
 context,
 actionId,
 confirm
 });
 return response.data;
 },
 agentAskStream: async (userId: number, question: string, context?: AgentContext, onChunk?: (chunk: string) => void, onComplete?: (fullAnswer: string) => void, onError?: (error: string) => void): Promise<void> => {
 const headers: HeadersInit = {
 'Content-Type': 'application/json',
 };
 const token = localStorage.getItem('token');
 if (token) {
 headers['Authorization'] = `Bearer ${token}`;
 }
 try {
 const response = await fetch(`${baseURL}/agent/ask`, {
 method: 'POST',
 headers,
 body: JSON.stringify({ userId, question, context, stream: false }),
 });
 if (!response.ok) {
 const errorText = await response.text();
 throw new Error(`请求失败: ${response.status} ${errorText}`);
 }
 const data = await response.json();
 if (data.answer) {
 const fullAnswer = data.answer;
 if (onChunk) {
 onChunk(fullAnswer);
 }
 if (onComplete) {
 onComplete(fullAnswer);
 }
 } else {
 if (onError) {
 onError('未获取到响应内容');
 }
 throw new Error('未获取到响应内容');
 }
 } catch (error) {
 console.error('[API] Error:', error);
 if (onError) {
 onError(error instanceof Error ? error.message : '未知错误');
 }
 throw error;
 }
 },
 agentAnalyze: async (userId: number, infoId: number, analysisType?: string): Promise<AgentResponse> => {
 const response = await apiClient.post<AgentResponse>('/agent/analyze', {
 userId,
 infoId,
 analysisType: analysisType || 'summary'
 });
 return response.data;
 },
 agentHistory: async (userId: number, page = 1, pageSize = 10): Promise<any> => {
    const response = await apiClient.get('/agent/history', {
      params: { userId, page, pageSize }
    });
    return response.data;
  },
  adminGetUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>('/admin/users');
    return response.data;
  },
  adminGetUserPosts: async (userId: number): Promise<InfoItem[]> => {
    const response = await apiClient.get<InfoItem[]>(`/admin/users/${userId}/posts`);
    return response.data;
  },
  adminDeleteUserPost: async (userId: number, postId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}/posts/${postId}`);
  },
  updateProfile: async (data: { email?: string; name?: string; password?: string }): Promise<any> => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  }
};
