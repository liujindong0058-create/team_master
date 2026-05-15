export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
