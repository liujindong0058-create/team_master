export interface Assessment {
  id: string;
  memberId: string;
  period: string;
  workQuality: number;
  efficiency: number;
  communication: number;
  innovation: number;
  teamwork: number;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentRequest {
  period: string;
  workQuality: number;
  efficiency: number;
  communication: number;
  innovation: number;
  teamwork: number;
  summary: string;
}

export interface UpdateAssessmentRequest {
  period?: string;
  workQuality?: number;
  efficiency?: number;
  communication?: number;
  innovation?: number;
  teamwork?: number;
  summary?: string;
}

export interface AssessmentDimension {
  key: string;
  name: string;
  maxScore: number;
}

export const ASSESSMENT_DIMENSIONS: AssessmentDimension[] = [
  { key: 'workQuality', name: '工作质量', maxScore: 10 },
  { key: 'efficiency', name: '工作效率', maxScore: 10 },
  { key: 'communication', name: '沟通能力', maxScore: 10 },
  { key: 'innovation', name: '创新能力', maxScore: 10 },
  { key: 'teamwork', name: '团队协作', maxScore: 10 },
];
