import { create } from 'zustand';
import type { BloodSugarReading, NewBloodSugarReading } from '../../shared/database/schema';
import { bloodSugarRepository } from './repository';

interface BloodSugarState {
  readings: BloodSugarReading[];
  load: () => Promise<void>;
  add: (data: Omit<NewBloodSugarReading, 'id'>) => Promise<BloodSugarReading>;
  update: (id: number, data: Partial<Omit<NewBloodSugarReading, 'id'>>) => Promise<BloodSugarReading>;
  remove: (id: number) => Promise<void>;
  restore: (data: Omit<NewBloodSugarReading, 'id'>) => Promise<void>;
}

export const useBloodSugarStore = create<BloodSugarState>((set) => ({
  readings: [],

  load: async () => {
    const readings = await bloodSugarRepository.getAll();
    set({ readings });
  },

  add: async (data) => {
    const created = await bloodSugarRepository.insert(data);
    set((state) => ({ readings: [created, ...state.readings] }));
    return created;
  },

  update: async (id, data) => {
    const updated = await bloodSugarRepository.update(id, data);
    set((state) => ({
      readings: state.readings.map((r) => (r.id === id ? updated : r)),
    }));
    return updated;
  },

  remove: async (id) => {
    await bloodSugarRepository.delete(id);
    set((state) => ({
      readings: state.readings.filter((r) => r.id !== id),
    }));
  },

  restore: async (data) => {
    const created = await bloodSugarRepository.insert(data);
    set((state) => {
      const next = [created, ...state.readings];
      next.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return { readings: next };
    });
  },
}));
