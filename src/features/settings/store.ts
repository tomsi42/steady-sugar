import { create } from 'zustand';
import type { AppSettings } from '../../shared/database/schema';

interface SettingsState {
  settings: AppSettings | null;
  setSettings: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));
