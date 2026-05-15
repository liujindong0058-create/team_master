import api from './api';
import { Member, CreateMemberRequest, UpdateMemberRequest } from '@/types';

export const membersApi = {
  // 获取团队成员列表
  getMembers: (teamId: string): Promise<Member[]> => {
    return api.get(`/teams/${teamId}/members`);
  },

  // 获取单个成员
  getMember: (id: string): Promise<Member> => {
    return api.get(`/members/${id}`);
  },

  // 创建成员
  createMember: (teamId: string, data: CreateMemberRequest): Promise<Member> => {
    return api.post(`/teams/${teamId}/members`, data);
  },

  // 更新成员
  updateMember: (id: string, data: UpdateMemberRequest): Promise<Member> => {
    return api.put(`/members/${id}`, data);
  },

  // 删除成员
  deleteMember: (id: string): Promise<void> => {
    return api.delete(`/members/${id}`);
  },
};
