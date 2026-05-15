import api from './api';
import { Profile, Note, FirstImpression, CreateNoteRequest, UpdateNoteRequest } from '@/types';

export const profilesApi = {
  // 获取成员档案
  getProfile: (memberId: string): Promise<Profile> => {
    return api.get(`/members/${memberId}/profile`);
  },

  // 获取初印象
  getFirstImpression: (memberId: string): Promise<FirstImpression | null> => {
    return api.get(`/members/${memberId}/first-impression`);
  },

  // 创建/更新初印象
  saveFirstImpression: (memberId: string, content: string): Promise<FirstImpression> => {
    return api.post(`/members/${memberId}/first-impression`, { content });
  },

  // 获取笔记列表
  getNotes: (memberId: string): Promise<Note[]> => {
    return api.get(`/members/${memberId}/notes`);
  },

  // 创建笔记
  createNote: (memberId: string, data: CreateNoteRequest): Promise<Note> => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    return api.post(`/members/${memberId}/notes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 更新笔记
  updateNote: (noteId: string, data: UpdateNoteRequest): Promise<Note> => {
    return api.put(`/notes/${noteId}`, data);
  },

  // 删除笔记
  deleteNote: (noteId: string): Promise<void> => {
    return api.delete(`/notes/${noteId}`);
  },

  // 上传图片（截图粘贴）
  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
