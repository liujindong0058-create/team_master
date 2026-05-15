import api from './api';
import { LoginResponse } from '@/types';

export const authApi = {
  // 模拟微信登录
  wechatLogin: (code: string): Promise<LoginResponse> => {
    return api.post('/auth/wechat', { code });
  },

  // 模拟登录（用于测试）
  mockLogin: (): Promise<LoginResponse> => {
    return api.post('/auth/mock-login');
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  // 退出登录
  logout: () => {
    return api.post('/auth/logout');
  },
};
