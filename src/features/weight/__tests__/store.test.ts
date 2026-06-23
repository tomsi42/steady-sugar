import { useWeightStore } from '../store';
import type { WeightEntry } from '../../../shared/database/schema';

const mockGetAll = jest.fn<WeightEntry[], []>();
const mockInsert = jest.fn<WeightEntry, [any]>();
const mockUpdate = jest.fn<WeightEntry, [number, any]>();
const mockDelete = jest.fn<void, [number]>();

jest.mock('../repository', () => ({
  weightRepository: {
    getAll: () => mockGetAll(),
    insert: (data: any) => mockInsert(data),
    update: (id: number, data: any) => mockUpdate(id, data),
    delete: (id: number) => mockDelete(id),
  },
}));

function makeEntry(id: number, valueKg = 80.0): WeightEntry {
  return {
    id,
    valueKg,
    timestamp: new Date('2026-06-17T12:00:00'),
    notes: '',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useWeightStore.setState({ entries: [] });
});

describe('useWeightStore', () => {
  describe('load', () => {
    it('fetches entries from repository and sets state', () => {
      const entries = [makeEntry(1), makeEntry(2, 79.5)];
      mockGetAll.mockReturnValue(entries);

      useWeightStore.getState().load();

      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(useWeightStore.getState().entries).toEqual(entries);
    });
  });

  describe('add', () => {
    it('inserts an entry and prepends it to state', () => {
      const newEntry = makeEntry(1, 82.3);
      mockInsert.mockReturnValue(newEntry);

      useWeightStore.getState().add({
        valueKg: 82.3,
        timestamp: newEntry.timestamp,
        notes: '',
      });

      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(useWeightStore.getState().entries[0]).toEqual(newEntry);
    });
  });

  describe('update', () => {
    it('updates an entry in state', () => {
      const original = makeEntry(1, 80.0);
      const updated = { ...original, valueKg: 79.5 };
      useWeightStore.setState({ entries: [original] });
      mockUpdate.mockReturnValue(updated);

      useWeightStore.getState().update(1, { valueKg: 79.5 });

      expect(mockUpdate).toHaveBeenCalledWith(1, { valueKg: 79.5 });
      expect(useWeightStore.getState().entries[0].valueKg).toBe(79.5);
    });
  });

  describe('remove', () => {
    it('deletes an entry and removes it from state', () => {
      const entry = makeEntry(1);
      useWeightStore.setState({ entries: [entry] });
      mockDelete.mockImplementation(() => {});

      useWeightStore.getState().remove(1);

      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(useWeightStore.getState().entries).toHaveLength(0);
    });
  });

  describe('restore', () => {
    it('re-inserts a deleted entry and sorts by timestamp descending', () => {
      const older = makeEntry(2, 81.0);
      older.timestamp = new Date('2026-06-16T12:00:00');
      useWeightStore.setState({ entries: [older] });

      const restored = makeEntry(3, 80.0);
      restored.timestamp = new Date('2026-06-17T12:00:00');
      mockInsert.mockReturnValue(restored);

      useWeightStore.getState().restore({
        valueKg: 80.0,
        timestamp: restored.timestamp,
        notes: '',
      });

      const state = useWeightStore.getState().entries;
      expect(state[0].id).toBe(3);
      expect(state[1].id).toBe(2);
    });
  });
});
