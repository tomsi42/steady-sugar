import { create } from 'zustand';
import type { WeightEntry, NewWeightEntry } from '../../shared/database/schema';
import { weightRepository } from './repository';

interface WeightState {
  entries: WeightEntry[];
  load: () => Promise<void>;
  add: (data: Omit<NewWeightEntry, 'id'>) => Promise<WeightEntry>;
  update: (id: number, data: Partial<Omit<NewWeightEntry, 'id'>>) => Promise<WeightEntry>;
  remove: (id: number) => Promise<void>;
  restore: (data: Omit<NewWeightEntry, 'id'>) => Promise<void>;
}

export const useWeightStore = create<WeightState>((set) => ({
  entries: [],

  load: async () => {
    const entries = await weightRepository.getAll();
    set({ entries });
  },

  add: async (data) => {
    const created = await weightRepository.insert(data);
    set((state) => ({ entries: [created, ...state.entries] }));
    return created;
  },

  update: async (id, data) => {
    const updated = await weightRepository.update(id, data);
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },

  remove: async (id) => {
    await weightRepository.delete(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  restore: async (data) => {
    const created = await weightRepository.insert(data);
    set((state) => {
      const next = [created, ...state.entries];
      next.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return { entries: next };
    });
  },
}));
