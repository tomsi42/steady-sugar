import { create } from 'zustand';
import type { FoodEntry, NewFoodEntry } from '../../shared/database/schema';
import { foodRepository } from './repository';

interface FoodLogState {
  entries: FoodEntry[];
  load: () => void;
  add: (data: Omit<NewFoodEntry, 'id'>) => FoodEntry;
  update: (id: number, data: Partial<Omit<NewFoodEntry, 'id'>>) => FoodEntry;
  remove: (id: number) => void;
  restore: (data: Omit<NewFoodEntry, 'id'>) => void;
}

export const useFoodLogStore = create<FoodLogState>((set) => ({
  entries: [],

  load: () => {
    const entries = foodRepository.getAll();
    set({ entries });
  },

  add: (data) => {
    const created = foodRepository.insert(data);
    set((state) => ({ entries: [created, ...state.entries] }));
    return created;
  },

  update: (id, data) => {
    const updated = foodRepository.update(id, data);
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },

  remove: (id) => {
    foodRepository.delete(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  restore: (data) => {
    const created = foodRepository.insert(data);
    set((state) => {
      const next = [created, ...state.entries];
      next.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return { entries: next };
    });
  },
}));
