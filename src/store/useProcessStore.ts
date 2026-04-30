import { create } from 'zustand';

export interface AdminProcess {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error' | 'canceled';
  progress?: number;
  cancel?: () => void;
  message?: string;
  createdAt: number;
}

interface ProcessStore {
  processes: AdminProcess[];
  addProcess: (process: AdminProcess) => void;
  updateProcess: (id: string, updates: Partial<AdminProcess>) => void;
  removeProcess: (id: string) => void;
  clearCompleted: () => void;
}

export const useProcessStore = create<ProcessStore>((set) => ({
  processes: [],
  addProcess: (process) => set((state) => ({ processes: [process, ...state.processes] })),
  updateProcess: (id, updates) => set((state) => ({
    processes: state.processes.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  removeProcess: (id) => set((state) => ({
    processes: state.processes.filter(p => p.id !== id)
  })),
  clearCompleted: () => set((state) => ({
    processes: state.processes.filter(p => p.status === 'running')
  }))
}));
