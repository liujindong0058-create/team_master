export type MemberRole = 'owner' | 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: MemberRole;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  joinDate: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberRequest {
  name: string;
  avatar?: string;
  role: MemberRole;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
}

export interface UpdateMemberRequest {
  name?: string;
  avatar?: string;
  role?: MemberRole;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
}
