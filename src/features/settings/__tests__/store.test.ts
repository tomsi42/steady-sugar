import { useSettingsStore } from '../store';
import type { AppSettings } from '../../../shared/database/schema';

const mockGet = jest.fn<AppSettings | null, []>();
const mockUpsert = jest.fn<AppSettings, [any]>();
const mockClearAll = jest.fn<void, []>();

jest.mock('../repository', () => ({
  settingsRepository: {
    get: () => mockGet(),
    upsert: (data: any) => mockUpsert(data),
    clearAll: () => mockClearAll(),
  },
}));

function makeSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    id: 1,
    userName: 'Tom',
    targetMinMmol: 3.9,
    targetMaxMmol: 7.8,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useSettingsStore.setState({ settings: null, targetMinMmol: 3.9, targetMaxMmol: 7.8 });
});

describe('useSettingsStore', () => {
  describe('load', () => {
    it('sets settings and target values when a row exists', () => {
      const row = makeSettings({ targetMinMmol: 4.0, targetMaxMmol: 8.0 });
      mockGet.mockReturnValue(row);

      useSettingsStore.getState().load();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(useSettingsStore.getState().settings).toEqual(row);
      expect(useSettingsStore.getState().targetMinMmol).toBe(4.0);
      expect(useSettingsStore.getState().targetMaxMmol).toBe(8.0);
    });

    it('leaves settings null when no row exists', () => {
      mockGet.mockReturnValue(null);

      useSettingsStore.getState().load();

      expect(useSettingsStore.getState().settings).toBeNull();
      expect(useSettingsStore.getState().targetMinMmol).toBe(3.9);
      expect(useSettingsStore.getState().targetMaxMmol).toBe(7.8);
    });
  });

  describe('update', () => {
    it('calls upsert and updates store state', () => {
      const saved = makeSettings({ targetMinMmol: 5.0, targetMaxMmol: 9.0 });
      mockUpsert.mockReturnValue(saved);

      useSettingsStore.getState().update({
        userName: 'Tom',
        targetMinMmol: 5.0,
        targetMaxMmol: 9.0,
      });

      expect(mockUpsert).toHaveBeenCalledWith({
        userName: 'Tom',
        targetMinMmol: 5.0,
        targetMaxMmol: 9.0,
      });
      expect(useSettingsStore.getState().settings).toEqual(saved);
      expect(useSettingsStore.getState().targetMinMmol).toBe(5.0);
      expect(useSettingsStore.getState().targetMaxMmol).toBe(9.0);
    });
  });

  describe('clearAll', () => {
    it('calls repository clearAll and resets state to defaults', () => {
      useSettingsStore.setState({
        settings: makeSettings(),
        targetMinMmol: 5.0,
        targetMaxMmol: 9.0,
      });

      useSettingsStore.getState().clearAll();

      expect(mockClearAll).toHaveBeenCalledTimes(1);
      expect(useSettingsStore.getState().settings).toBeNull();
      expect(useSettingsStore.getState().targetMinMmol).toBe(3.9);
      expect(useSettingsStore.getState().targetMaxMmol).toBe(7.8);
    });
  });

  describe('setSettings', () => {
    it('updates settings and target values directly', () => {
      const s = makeSettings({ targetMinMmol: 4.5, targetMaxMmol: 8.5 });

      useSettingsStore.getState().setSettings(s);

      expect(useSettingsStore.getState().settings).toEqual(s);
      expect(useSettingsStore.getState().targetMinMmol).toBe(4.5);
      expect(useSettingsStore.getState().targetMaxMmol).toBe(8.5);
    });
  });
});
