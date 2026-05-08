export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  teamId: string;
  name: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'removed';
  strengths: string;
  weaknesses: string;
  tags: string;
  futureDirection: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  memberId: string;
  authorId: string;
  content: string;
  type: 'strength' | 'weakness' | 'critical' | 'daily';
  privacy: 'private' | 'team';
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  memberId: string;
  assessorId: string;
  period: 'week' | 'biweek' | 'month' | 'quarter';
  dimensions: {
    professional: number;
    collaboration: number;
    attitude: number;
    growth: number;
    contribution: number;
  };
  comment: string;
  assessedAt: string;
  createdAt: string;
}

export interface Task {
  id: string;
  teamId: string;
  title: string;
  description: string;
  requiredDimensions: Record<string, number>;
  memberId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  review?: string;
  createdAt: string;
  updatedAt: string;
}