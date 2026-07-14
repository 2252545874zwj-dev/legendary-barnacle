export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
<<<<<<< HEAD
  role: string;
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
  avatar?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface InfoItem {
  id: string;
  title: string;
  content: string;
  category: string;
  userId?: number;
  isPrivate: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  items: InfoItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Comment {
  id: number;
  infoId: number;
  userId?: number;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
