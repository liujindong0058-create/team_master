export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  avatar?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  avatar?: string;
}
