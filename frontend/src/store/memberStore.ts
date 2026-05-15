import { create } from 'zustand';
import { Member, CreateMemberRequest, UpdateMemberRequest } from '@/types';
import { membersApi } from '@/services';

interface MemberState {
  members: Member[];
  selectedMember: Member | null;
  isLoading: boolean;
  error: string | null;
}

interface MemberActions {
  fetchMembers: (teamId: string) => Promise<void>;
  selectMember: (member: Member | null) => void;
  createMember: (teamId: string, data: CreateMemberRequest) => Promise<void>;
  updateMember: (id: string, data: UpdateMemberRequest) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  clearMembers: () => void;
}

const initialState: MemberState = {
  members: [],
  selectedMember: null,
  isLoading: false,
  error: null,
};

export const useMemberStore = create<MemberState & MemberActions>((set, get) => ({
  ...initialState,

  fetchMembers: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const members = await membersApi.getMembers(teamId);
      set({ members, isLoading: false });
      // 如果没有选中成员，默认选中第一个
      if (!get().selectedMember && members.length > 0) {
        set({ selectedMember: members[0] });
      }
    } catch (error) {
      set({ error: '获取成员列表失败', isLoading: false });
    }
  },

  selectMember: (member: Member | null) => {
    set({ selectedMember: member });
  },

  createMember: async (teamId: string, data: CreateMemberRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newMember = await membersApi.createMember(teamId, data);
      set((state) => ({
        members: [...state.members, newMember],
        selectedMember: newMember,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '创建成员失败', isLoading: false });
      throw error;
    }
  },

  updateMember: async (id: string, data: UpdateMemberRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMember = await membersApi.updateMember(id, data);
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? updatedMember : m)),
        selectedMember: state.selectedMember?.id === id ? updatedMember : state.selectedMember,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '更新成员失败', isLoading: false });
      throw error;
    }
  },

  deleteMember: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await membersApi.deleteMember(id);
      set((state) => {
        const newMembers = state.members.filter((m) => m.id !== id);
        return {
          members: newMembers,
          selectedMember: state.selectedMember?.id === id
            ? (newMembers.length > 0 ? newMembers[0] : null)
            : state.selectedMember,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: '删除成员失败', isLoading: false });
      throw error;
    }
  },

  clearMembers: () => {
    set({ members: [], selectedMember: null });
  },
}));
