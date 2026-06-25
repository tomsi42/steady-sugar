import { useBloodSugarStore } from '../store';
import type { BloodSugarReading } from '../../../shared/database/schema';

const mockGetAll = jest.fn<Promise<BloodSugarReading[]>, []>();
const mockInsert = jest.fn<Promise<BloodSugarReading>, [any]>();
const mockUpdate = jest.fn<Promise<BloodSugarReading>, [number, any]>();
const mockDelete = jest.fn<Promise<void>, [number]>();

jest.mock('../repository', () => ({
  bloodSugarRepository: {
    getAll: () => mockGetAll(),
    insert: (data: any) => mockInsert(data),
    update: (id: number, data: any) => mockUpdate(id, data),
    delete: (id: number) => mockDelete(id),
  },
}));

function makeReading(id: number, valueMmol = 5.5): BloodSugarReading {
  return {
    id,
    valueMmol,
    timestamp: new Date('2026-06-17T08:00:00'),
    context: 'random',
    notes: '',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useBloodSugarStore.setState({ readings: [] });
});

describe('useBloodSugarStore', () => {
  describe('load', () => {
    it('fetches readings from repository and sets state', async () => {
      const readings = [makeReading(1), makeReading(2, 7.2)];
      mockGetAll.mockResolvedValue(readings);

      await useBloodSugarStore.getState().load();

      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(useBloodSugarStore.getState().readings).toEqual(readings);
    });
  });

  describe('add', () => {
    it('inserts a reading and prepends it to state', async () => {
      const newReading = makeReading(1, 6.1);
      mockInsert.mockResolvedValue(newReading);

      await useBloodSugarStore.getState().add({
        valueMmol: 6.1,
        timestamp: newReading.timestamp,
        context: 'random',
        notes: '',
      });

      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(useBloodSugarStore.getState().readings).toHaveLength(1);
      expect(useBloodSugarStore.getState().readings[0]).toEqual(newReading);
    });
  });

  describe('update', () => {
    it('updates a reading in state', async () => {
      const original = makeReading(1, 5.5);
      const updated = { ...original, valueMmol: 8.0 };
      useBloodSugarStore.setState({ readings: [original] });
      mockUpdate.mockResolvedValue(updated);

      await useBloodSugarStore.getState().update(1, { valueMmol: 8.0 });

      expect(mockUpdate).toHaveBeenCalledWith(1, { valueMmol: 8.0 });
      expect(useBloodSugarStore.getState().readings[0].valueMmol).toBe(8.0);
    });
  });

  describe('remove', () => {
    it('deletes a reading and removes it from state', async () => {
      const reading = makeReading(1);
      useBloodSugarStore.setState({ readings: [reading] });
      mockDelete.mockResolvedValue(undefined);

      await useBloodSugarStore.getState().remove(1);

      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(useBloodSugarStore.getState().readings).toHaveLength(0);
    });
  });

  describe('restore', () => {
    it('re-inserts a deleted reading and sorts by timestamp', async () => {
      const older = makeReading(2, 5.0);
      older.timestamp = new Date('2026-06-16T08:00:00');
      useBloodSugarStore.setState({ readings: [older] });

      const restored = makeReading(3, 7.2);
      restored.timestamp = new Date('2026-06-17T08:00:00');
      mockInsert.mockResolvedValue(restored);

      await useBloodSugarStore.getState().restore({
        valueMmol: 7.2,
        timestamp: restored.timestamp,
        context: 'random',
        notes: '',
      });

      const state = useBloodSugarStore.getState().readings;
      expect(state[0].id).toBe(3); // newer first
      expect(state[1].id).toBe(2);
    });
  });
});
