import api from './api';
import { Assessment, CreateAssessmentRequest, UpdateAssessmentRequest } from '@/types';

export const assessmentsApi = {
  // 获取成员评估列表
  getAssessments: (memberId: string): Promise<Assessment[]> => {
    return api.get(`/members/${memberId}/assessments`);
  },

  // 获取单个评估
  getAssessment: (id: string): Promise<Assessment> => {
    return api.get(`/assessments/${id}`);
  },

  // 创建评估
  createAssessment: (memberId: string, data: CreateAssessmentRequest): Promise<Assessment> => {
    return api.post(`/members/${memberId}/assessments`, data);
  },

  // 更新评估
  updateAssessment: (id: string, data: UpdateAssessmentRequest): Promise<Assessment> => {
    return api.put(`/assessments/${id}`, data);
  },

  // 删除评估
  deleteAssessment: (id: string): Promise<void> => {
    return api.delete(`/assessments/${id}`);
  },
};
