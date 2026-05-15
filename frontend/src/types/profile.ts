export interface Note {
  id: string;
  memberId: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface FirstImpression {
  id: string;
  memberId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  memberId: string;
  firstImpression?: FirstImpression;
  notes: Note[];
}

export interface CreateNoteRequest {
  content: string;
  attachments?: File[];
}

export interface UpdateNoteRequest {
  content?: string;
}
