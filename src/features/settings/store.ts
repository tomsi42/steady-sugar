import { create } from 'zustand';
import { settingsRepository } from './repository';
import type { AppSettings } from '../../shared/database/schema';

interface SettingsState {
  settings: AppSettings | null;
  targetMinMmol: number;
  targetMaxMmol: number;
  load: () => Promise<void>;
  update: (data: Omit<AppSettings, 'id'>) => Promise<void>;
  clearAll: () => Promise<void>;
  setSettings: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  targetMinMmol: 3.9,
  targetMaxMmol: 7.8,

  load: async () => {
    const row = await settingsRepository.get();
    if (row) {
      set({ settings: row, targetMinMmol: row.targetMinMmol, targetMaxMmol: row.targetMaxMmol });
    }
  },

  update: async (data) => {
    const saved = await settingsRepository.upsert(data);
    set({ settings: saved, targetMinMmol: saved.targetMinMmol, targetMaxMmol: saved.targetMaxMmol });
  },

  clearAll: async () => {
    await settingsRepository.clearAll();
    set({ settings: null, targetMinMmol: 3.9, targetMaxMmol: 7.8 });
  },

  setSettings: (settings) =>
    set({ settings, targetMinMmol: settings.targetMinMmol, targetMaxMmol: settings.targetMaxMmol }),
}));
