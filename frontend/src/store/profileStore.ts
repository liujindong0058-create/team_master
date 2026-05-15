import { create } from 'zustand';
import { Note, FirstImpression, Assessment, MatrixItem, CreateNoteRequest, CreateAssessmentRequest, CreateMatrixRequest, UpdateMatrixRequest } from '@/types';
import { profilesApi, assessmentsApi, matrixApi } from '@/services';

interface ProfileState {
  // 初印象
  firstImpression: FirstImpression | null;
  // 小记
  notes: Note[];
  // 评估
  assessments: Assessment[];
  // 能力矩阵
  matrix: MatrixItem | null;
  // 状态
  isLoading: boolean;
  error: string | null;
}

interface ProfileActions {
  // 初印象
  fetchFirstImpression: (memberId: string) => Promise<void>;
  saveFirstImpression: (memberId: string, content: string) => Promise<void>;

  // 小记
  fetchNotes: (memberId: string) => Promise<void>;
  createNote: (memberId: string, data: CreateNoteRequest) => Promise<void>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;

  // 评估
  fetchAssessments: (memberId: string) => Promise<void>;
  createAssessment: (memberId: string, data: CreateAssessmentRequest) => Promise<void>;
  updateAssessment: (assessmentId: string, data: Partial<CreateAssessmentRequest>) => Promise<void>;
  deleteAssessment: (assessmentId: string) => Promise<void>;

  // 能力矩阵
  fetchMatrix: (memberId: string) => Promise<void>;
  saveMatrix: (memberId: string, data: CreateMatrixRequest) => Promise<void>;
  updateMatrix: (memberId: string, data: UpdateMatrixRequest) => Promise<void>;

  // 清空数据
  clearProfile: () => void;
}

const initialState: ProfileState = {
  firstImpression: null,
  notes: [],
  assessments: [],
  matrix: null,
  isLoading: false,
  error: null,
};

export const useProfileStore = create<ProfileState & ProfileActions>((set) => ({
  ...initialState,

  // 初印象
  fetchFirstImpression: async (memberId: string) => {
    try {
      const firstImpression = await profilesApi.getFirstImpression(memberId);
      set({ firstImpression });
    } catch (error) {
      set({ error: '获取初印象失败' });
    }
  },

  saveFirstImpression: async (memberId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const firstImpression = await profilesApi.saveFirstImpression(memberId, content);
      set({ firstImpression, isLoading: false });
    } catch (error) {
      set({ error: '保存初印象失败', isLoading: false });
      throw error;
    }
  },

  // 小记
  fetchNotes: async (memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await profilesApi.getNotes(memberId);
      // 按时间倒序排列
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: '获取笔记失败', isLoading: false });
    }
  },

  createNote: async (memberId: string, data: CreateNoteRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await profilesApi.createNote(memberId, data);
      set((state) => ({
        notes: [newNote, ...state.notes],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '创建笔记失败', isLoading: false });
      throw error;
    }
  },

  updateNote: async (noteId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await profilesApi.updateNote(noteId, { content });
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '更新笔记失败', isLoading: false });
      throw error;
    }
  },

  deleteNote: async (noteId: string) => {
    set({ isLoading: true, error: null });
    try {
      await profilesApi.deleteNote(noteId);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '删除笔记失败', isLoading: false });
      throw error;
    }
  },

  uploadImage: async (file: File) => {
    const response = await profilesApi.uploadImage(file);
    return response.url;
  },

  // 评估
  fetchAssessments: async (memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      const assessments = await assessmentsApi.getAssessments(memberId);
      // 按时间倒序排列
      assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set({ assessments, isLoading: false });
    } catch (error) {
      set({ error: '获取评估失败', isLoading: false });
    }
  },

  createAssessment: async (memberId: string, data: CreateAssessmentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newAssessment = await assessmentsApi.createAssessment(memberId, data);
      set((state) => ({
        assessments: [newAssessment, ...state.assessments],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '创建评估失败', isLoading: false });
      throw error;
    }
  },

  updateAssessment: async (assessmentId: string, data: Partial<CreateAssessmentRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAssessment = await assessmentsApi.updateAssessment(assessmentId, data);
      set((state) => ({
        assessments: state.assessments.map((a) => (a.id === assessmentId ? updatedAssessment : a)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '更新评估失败', isLoading: false });
      throw error;
    }
  },

  deleteAssessment: async (assessmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await assessmentsApi.deleteAssessment(assessmentId);
      set((state) => ({
        assessments: state.assessments.filter((a) => a.id !== assessmentId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '删除评估失败', isLoading: false });
      throw error;
    }
  },

  // 能力矩阵
  fetchMatrix: async (memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      const matrix = await matrixApi.getMatrix(memberId);
      set({ matrix, isLoading: false });
    } catch (error) {
      set({ error: '获取能力矩阵失败', isLoading: false });
    }
  },

  saveMatrix: async (memberId: string, data: CreateMatrixRequest) => {
    set({ isLoading: true, error: null });
    try {
      const matrix = await matrixApi.createMatrix(memberId, data);
      set({ matrix, isLoading: false });
    } catch (error) {
      set({ error: '保存能力矩阵失败', isLoading: false });
      throw error;
    }
  },

  updateMatrix: async (memberId: string, data: UpdateMatrixRequest) => {
    set({ isLoading: true, error: null });
    try {
      const matrix = await matrixApi.updateMatrix(memberId, data);
      set({ matrix, isLoading: false });
    } catch (error) {
      set({ error: '更新能力矩阵失败', isLoading: false });
      throw error;
    }
  },

  clearProfile: () => {
    set(initialState);
  },
}));
