import { create } from 'zustand';
import type { User, Team, Member, Note, Assessment, Task } from '../types';

interface AppState {
  user: User | null;
  teams: Team[];
  currentTeam: Team | null;
  members: Member[];
  notes: Note[];
  assessments: Assessment[];
  tasks: Task[];
  setUser: (user: User | null) => void;
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  setMembers: (members: Member[]) => void;
  setNotes: (notes: Note[]) => void;
  setAssessments: (assessments: Assessment[]) => void;
  setTasks: (tasks: Task[]) => void;
  addTeam: (team: Team) => void;
  addMember: (member: Member) => void;
  addNote: (note: Note) => void;
  addAssessment: (assessment: Assessment) => void;
  addTask: (task: Task) => void;
  clearState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  teams: [],
  currentTeam: null,
  members: [],
  notes: [],
  assessments: [],
  tasks: [],
  
  setUser: (user) => set({ user }),
  
  setTeams: (teams) => set({ teams }),
  
  setCurrentTeam: (team) => set({ currentTeam: team }),
  
  setMembers: (members) => set({ members }),
  
  setNotes: (notes) => set({ notes }),
  
  setAssessments: (assessments) => set({ assessments }),
  
  setTasks: (tasks) => set({ tasks }),
  
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  
  addAssessment: (assessment) => set((state) => ({ assessments: [...state.assessments, assessment] })),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  clearState: () => set({
    user: null,
    teams: [],
    currentTeam: null,
    members: [],
    notes: [],
    assessments: [],
    tasks: [],
  }),
}));