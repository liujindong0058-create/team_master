import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginResponse } from '@/types';
import { authApi } from '@/services';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setAuth: (data: LoginResponse) => void;
  clearAuth: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (data: LoginResponse) => {
        localStorage.setItem('token', data.token);
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          error: null,
        });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        set(initialState);
      },

      login: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.mockLogin();
          get().setAuth(response);
        } catch (error) {
          set({ error: '登录失败，请重试', isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          get().clearAuth();
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser() as unknown as User;
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
