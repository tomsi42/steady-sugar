import { create } from 'zustand';
import type { BloodSugarReading, NewBloodSugarReading } from '../../shared/database/schema';
import { bloodSugarRepository } from './repository';

interface BloodSugarState {
  readings: BloodSugarReading[];
  load: () => void;
  add: (data: Omit<NewBloodSugarReading, 'id'>) => BloodSugarReading;
  update: (id: number, data: Partial<Omit<NewBloodSugarReading, 'id'>>) => BloodSugarReading;
  remove: (id: number) => void;
  restore: (data: Omit<NewBloodSugarReading, 'id'>) => void;
}

export const useBloodSugarStore = create<BloodSugarState>((set) => ({
  readings: [],

  load: () => {
    const readings = bloodSugarRepository.getAll();
    set({ readings });
  },

  add: (data) => {
    const created = bloodSugarRepository.insert(data);
    set((state) => ({
      readings: [created, ...state.readings],
    }));
    return created;
  },

  update: (id, data) => {
    const updated = bloodSugarRepository.update(id, data);
    set((state) => ({
      readings: state.readings.map((r) => (r.id === id ? updated : r)),
    }));
    return updated;
  },

  remove: (id) => {
    bloodSugarRepository.delete(id);
    set((state) => ({
      readings: state.readings.filter((r) => r.id !== id),
    }));
  },

  restore: (data) => {
    const created = bloodSugarRepository.insert(data);
    set((state) => {
      const next = [created, ...state.readings];
      // Re-sort by timestamp descending after restore
      next.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return { readings: next };
    });
  },
}));
