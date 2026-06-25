import { useFoodLogStore } from '../store';
import type { FoodEntry } from '../../../shared/database/schema';

const mockGetAll = jest.fn<Promise<FoodEntry[]>, []>();
const mockInsert = jest.fn<Promise<FoodEntry>, [any]>();
const mockUpdate = jest.fn<Promise<FoodEntry>, [number, any]>();
const mockDelete = jest.fn<Promise<void>, [number]>();

jest.mock('../repository', () => ({
  foodRepository: {
    getAll: () => mockGetAll(),
    insert: (data: any) => mockInsert(data),
    update: (id: number, data: any) => mockUpdate(id, data),
    delete: (id: number) => mockDelete(id),
  },
}));

function makeEntry(id: number, name = 'Oatmeal'): FoodEntry {
  return {
    id,
    name,
    category: 'breakfast',
    timestamp: new Date('2026-06-17T08:00:00'),
    photoUri: null,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useFoodLogStore.setState({ entries: [] });
});

describe('useFoodLogStore', () => {
  describe('load', () => {
    it('fetches entries from repository and sets state', async () => {
      const entries = [makeEntry(1), makeEntry(2, 'Salad')];
      mockGetAll.mockResolvedValue(entries);

      await useFoodLogStore.getState().load();

      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(useFoodLogStore.getState().entries).toEqual(entries);
    });
  });

  describe('add', () => {
    it('inserts an entry and prepends it to state', async () => {
      const newEntry = makeEntry(1);
      mockInsert.mockResolvedValue(newEntry);

      await useFoodLogStore.getState().add({
        name: 'Oatmeal',
        category: 'breakfast',
        timestamp: newEntry.timestamp,
      });

      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(useFoodLogStore.getState().entries).toHaveLength(1);
      expect(useFoodLogStore.getState().entries[0]).toEqual(newEntry);
    });
  });

  describe('update', () => {
    it('updates an entry in state', async () => {
      const original = makeEntry(1, 'Toast');
      const updated = { ...original, name: 'Avocado Toast' };
      useFoodLogStore.setState({ entries: [original] });
      mockUpdate.mockResolvedValue(updated);

      await useFoodLogStore.getState().update(1, { name: 'Avocado Toast' });

      expect(mockUpdate).toHaveBeenCalledWith(1, { name: 'Avocado Toast' });
      expect(useFoodLogStore.getState().entries[0].name).toBe('Avocado Toast');
    });
  });

  describe('remove', () => {
    it('deletes an entry and removes it from state', async () => {
      const entry = makeEntry(1);
      useFoodLogStore.setState({ entries: [entry] });
      mockDelete.mockResolvedValue(undefined);

      await useFoodLogStore.getState().remove(1);

      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(useFoodLogStore.getState().entries).toHaveLength(0);
    });
  });

  describe('restore', () => {
    it('re-inserts a deleted entry and sorts by timestamp descending', async () => {
      const older = makeEntry(2, 'Yogurt');
      older.timestamp = new Date('2026-06-16T08:00:00');
      useFoodLogStore.setState({ entries: [older] });

      const restored = makeEntry(3, 'Oatmeal');
      restored.timestamp = new Date('2026-06-17T08:00:00');
      mockInsert.mockResolvedValue(restored);

      await useFoodLogStore.getState().restore({
        name: 'Oatmeal',
        category: 'breakfast',
        timestamp: restored.timestamp,
      });

      const state = useFoodLogStore.getState().entries;
      expect(state[0].id).toBe(3);
      expect(state[1].id).toBe(2);
    });
  });
});
