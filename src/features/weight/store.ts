import { create } from 'zustand';
import type { WeightEntry, NewWeightEntry } from '../../shared/database/schema';
import { weightRepository } from './repository';

interface WeightState {
  entries: WeightEntry[];
  load: () => void;
  add: (data: Omit<NewWeightEntry, 'id'>) => WeightEntry;
  update: (id: number, data: Partial<Omit<NewWeightEntry, 'id'>>) => WeightEntry;
  remove: (id: number) => void;
  restore: (data: Omit<NewWeightEntry, 'id'>) => void;
}

export const useWeightStore = create<WeightState>((set) => ({
  entries: [],

  load: () => {
    const entries = weightRepository.getAll();
    set({ entries });
  },

  add: (data) => {
    const created = weightRepository.insert(data);
    set((state) => ({ entries: [created, ...state.entries] }));
    return created;
  },

  update: (id, data) => {
    const updated = weightRepository.update(id, data);
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },

  remove: (id) => {
    weightRepository.delete(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  restore: (data) => {
    const created = weightRepository.insert(data);
    set((state) => {
      const next = [created, ...state.entries];
      next.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return { entries: next };
    });
  },
}));
