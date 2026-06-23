import { create } from 'zustand';
import type { FoodEntry } from '../../shared/database/schema';

interface FoodLogState {
  entries: FoodEntry[];
  setEntries: (entries: FoodEntry[]) => void;
}

export const useFoodLogStore = create<FoodLogState>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
}));
