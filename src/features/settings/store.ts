import { create } from 'zustand';
import { db } from '../../shared/database/client';
import { appSettings, type AppSettings } from '../../shared/database/schema';

interface SettingsState {
  settings: AppSettings | null;
  targetMinMmol: number;
  targetMaxMmol: number;
  load: () => void;
  setSettings: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  targetMinMmol: 3.9,
  targetMaxMmol: 7.8,
  load: () => {
    const row = db.select().from(appSettings).get();
    if (row) {
      set({
        settings: row,
        targetMinMmol: row.targetMinMmol,
        targetMaxMmol: row.targetMaxMmol,
      });
    }
  },
  setSettings: (settings) =>
    set({
      settings,
      targetMinMmol: settings.targetMinMmol,
      targetMaxMmol: settings.targetMaxMmol,
    }),
}));
