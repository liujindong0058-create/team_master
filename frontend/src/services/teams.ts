import api from './api';
import { Team, CreateTeamRequest, UpdateTeamRequest } from '@/types';

export const teamsApi = {
  // 获取团队列表
  getTeams: (): Promise<Team[]> => {
    return api.get('/teams');
  },

  // 获取单个团队
  getTeam: (id: string): Promise<Team> => {
    return api.get(`/teams/${id}`);
  },

  // 创建团队
  createTeam: (data: CreateTeamRequest): Promise<Team> => {
    return api.post('/teams', data);
  },

  // 更新团队
  updateTeam: (id: string, data: UpdateTeamRequest): Promise<Team> => {
    return api.put(`/teams/${id}`, data);
  },

  // 删除团队
  deleteTeam: (id: string): Promise<void> => {
    return api.delete(`/teams/${id}`);
  },
};
