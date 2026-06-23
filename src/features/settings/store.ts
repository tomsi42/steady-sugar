import { create } from 'zustand';
import { settingsRepository } from './repository';
import type { AppSettings } from '../../shared/database/schema';

interface SettingsState {
  settings: AppSettings | null;
  targetMinMmol: number;
  targetMaxMmol: number;
  load: () => void;
  update: (data: Omit<AppSettings, 'id'>) => void;
  clearAll: () => void;
  setSettings: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  targetMinMmol: 3.9,
  targetMaxMmol: 7.8,
  load: () => {
    const row = settingsRepository.get();
    if (row) {
      set({ settings: row, targetMinMmol: row.targetMinMmol, targetMaxMmol: row.targetMaxMmol });
    }
  },
  update: (data) => {
    const saved = settingsRepository.upsert(data);
    set({ settings: saved, targetMinMmol: saved.targetMinMmol, targetMaxMmol: saved.targetMaxMmol });
  },
  clearAll: () => {
    settingsRepository.clearAll();
    set({ settings: null, targetMinMmol: 3.9, targetMaxMmol: 7.8 });
  },
  setSettings: (settings) =>
    set({ settings, targetMinMmol: settings.targetMinMmol, targetMaxMmol: settings.targetMaxMmol }),
}));
