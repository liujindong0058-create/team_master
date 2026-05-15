import api from './api';
import { MatrixItem, CreateMatrixRequest, UpdateMatrixRequest } from '@/types';

export const matrixApi = {
  // 获取成员能力矩阵
  getMatrix: (memberId: string): Promise<MatrixItem | null> => {
    return api.get(`/members/${memberId}/matrix`);
  },

  // 创建能力矩阵
  createMatrix: (memberId: string, data: CreateMatrixRequest): Promise<MatrixItem> => {
    return api.post(`/members/${memberId}/matrix`, data);
  },

  // 更新能力矩阵
  updateMatrix: (memberId: string, data: UpdateMatrixRequest): Promise<MatrixItem> => {
    return api.put(`/members/${memberId}/matrix`, data);
  },

  // 删除能力矩阵
  deleteMatrix: (memberId: string): Promise<void> => {
    return api.delete(`/members/${memberId}/matrix`);
  },
};
