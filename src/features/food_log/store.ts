import { create } from 'zustand';
import type { FoodEntry, NewFoodEntry } from '../../shared/database/schema';
import { foodRepository } from './repository';

interface FoodLogState {
  entries: FoodEntry[];
  load: () => Promise<void>;
  add: (data: Omit<NewFoodEntry, 'id'>) => Promise<FoodEntry>;
  update: (id: number, data: Partial<Omit<NewFoodEntry, 'id'>>) => Promise<FoodEntry>;
  remove: (id: number) => Promise<void>;
  restore: (data: Omit<NewFoodEntry, 'id'>) => Promise<void>;
}

export const useFoodLogStore = create<FoodLogState>((set) => ({
  entries: [],

  load: async () => {
    const entries = await foodRepository.getAll();
    set({ entries });
  },

  add: async (data) => {
    const created = await foodRepository.insert(data);
    set((state) => ({ entries: [created, ...state.entries] }));
    return created;
  },

  update: async (id, data) => {
    const updated = await foodRepository.update(id, data);
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },

  remove: async (id) => {
    await foodRepository.delete(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  restore: async (data) => {
    const created = await foodRepository.insert(data);
    set((state) => {
      const next = [created, ...state.entries];
      next.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return { entries: next };
    });
  },
}));
