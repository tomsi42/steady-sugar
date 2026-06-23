import { create } from 'zustand';
import type { WeightEntry } from '../../shared/database/schema';

interface WeightState {
  entries: WeightEntry[];
  setEntries: (entries: WeightEntry[]) => void;
}

export const useWeightStore = create<WeightState>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
}));
