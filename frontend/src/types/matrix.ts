export interface MatrixItem {
  id: string;
  memberId: string;
  technical: number;
  communication: number;
  leadership: number;
  execution: number;
  learning: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatrixRequest {
  technical: number;
  communication: number;
  leadership: number;
  execution: number;
  learning: number;
}

export interface UpdateMatrixRequest {
  technical?: number;
  communication?: number;
  leadership?: number;
  execution?: number;
  learning?: number;
}

export interface MatrixDimension {
  key: string;
  name: string;
  fullMark: number;
}

export const MATRIX_DIMENSIONS: MatrixDimension[] = [
  { key: 'technical', name: '技术能力', fullMark: 5 },
  { key: 'communication', name: '沟通能力', fullMark: 5 },
  { key: 'leadership', name: '领导力', fullMark: 5 },
  { key: 'execution', name: '执行力', fullMark: 5 },
  { key: 'learning', name: '学习能力', fullMark: 5 },
];

export interface RadarDataItem {
  subject: string;
  A: number;
  fullMark: number;
}
