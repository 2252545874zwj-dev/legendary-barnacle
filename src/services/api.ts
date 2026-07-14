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
<<<<<<< HEAD
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
=======
 success: boolean;
 answer: string;
 interactionType: string;
 data?: any;
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
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
<<<<<<< HEAD
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
 return new Promise((resolve, reject) => {
 const xhr = new XMLHttpRequest();
 xhr.open('POST', `${baseURL}/agent/ask`, true);
 xhr.setRequestHeader('Content-Type', 'application/json');
 const token = localStorage.getItem('token');
 if (token) {
 xhr.setRequestHeader('Authorization', `Bearer ${token}`);
 }
 let fullAnswer = '';
 let lastProcessedLength = 0;
 xhr.onreadystatechange = () => {
 console.log('[API] readyState:', xhr.readyState, 'status:', xhr.status);
 if (xhr.readyState === 3) {
 const responseText = xhr.responseText;
 console.log('[API] responseText length:', responseText.length);
 const newContent = responseText.slice(lastProcessedLength);
 console.log('[API] newContent:', newContent.substring(0, 50));
 const parts = newContent.split('\n\n');
 console.log('[API] parts count:', parts.length);
 for (const part of parts) {
 if (part.startsWith('data: ')) {
 try {
 const jsonStr = part.slice(6);
 const data = JSON.parse(jsonStr);
 console.log('[API] parsed data:', data);
 if (data.type === 'stream' && data.content && onChunk) {
 fullAnswer += data.content;
 onChunk(data.content);
 } else if (data.type === 'end' && onComplete) {
 onComplete(fullAnswer);
 resolve();
 } else if (data.type === 'error' && onError) {
 onError(data.content);
 reject(new Error(data.content));
 }
 } catch (e) {
 console.error('[API] parse error:', e);
 }
 }
 }
 lastProcessedLength = responseText.length;
 } else if (xhr.readyState === 4) {
 console.log('[API] request complete, fullAnswer:', fullAnswer.length);
 if (xhr.status === 200 && fullAnswer && onComplete) {
 onComplete(fullAnswer);
 resolve();
 } else if (xhr.status !== 200 && onError) {
 onError('请求失败');
 reject(new Error('请求失败'));
 }
 }
 };
 xhr.onerror = () => {
 if (onError) {
 onError('网络错误');
 }
 reject(new Error('网络错误'));
 };
 xhr.send(JSON.stringify({
 userId,
 question,
 context,
 stream: true
 }));
 });
 },
=======
 agentAsk: async (userId: number, question: string, context?: AgentContext): Promise<AgentResponse> => {
 const response = await apiClient.post<AgentResponse>('/agent/ask', {
 userId,
 question,
 context
 });
 return response.data;
 },
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
 agentAnalyze: async (userId: number, infoId: number, analysisType?: string): Promise<AgentResponse> => {
 const response = await apiClient.post<AgentResponse>('/agent/analyze', {
 userId,
 infoId,
 analysisType: analysisType || 'summary'
 });
 return response.data;
 },
 agentHistory: async (userId: number, page = 1, pageSize = 10): Promise<any> => {
<<<<<<< HEAD
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
=======
 const response = await apiClient.get('/agent/history', {
 params: { userId, page, pageSize }
 });
 return response.data;
 }
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
};
