import { create } from 'zustand';
import { Team } from '@/types';
import { teamsApi } from '@/services';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
}

interface TeamActions {
  fetchTeams: () => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;
  createTeam: (data: { name: string; description?: string }) => Promise<void>;
  updateTeam: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,
};

export const useTeamStore = create<TeamState & TeamActions>((set, get) => ({
  ...initialState,

  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamsApi.getTeams();
      set({ teams, isLoading: false });
      // 如果没有当前选中团队，默认选中第一个
      if (!get().currentTeam && teams.length > 0) {
        set({ currentTeam: teams[0] });
      }
    } catch (error) {
      set({ error: '获取团队列表失败', isLoading: false });
    }
  },

  setCurrentTeam: (team: Team | null) => {
    set({ currentTeam: team });
  },

  createTeam: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTeam = await teamsApi.createTeam(data);
      set((state) => ({
        teams: [...state.teams, newTeam],
        currentTeam: newTeam,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '创建团队失败', isLoading: false });
      throw error;
    }
  },

  updateTeam: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTeam = await teamsApi.updateTeam(id, data);
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? updatedTeam : t)),
        currentTeam: state.currentTeam?.id === id ? updatedTeam : state.currentTeam,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '更新团队失败', isLoading: false });
      throw error;
    }
  },

  deleteTeam: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await teamsApi.deleteTeam(id);
      set((state) => {
        const newTeams = state.teams.filter((t) => t.id !== id);
        return {
          teams: newTeams,
          currentTeam: state.currentTeam?.id === id
            ? (newTeams.length > 0 ? newTeams[0] : null)
            : state.currentTeam,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: '删除团队失败', isLoading: false });
      throw error;
    }
  },
}));
