import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { importData } from '../utils/importData';

const mockBloodSugarExists = jest.fn();
const mockInsertBloodSugar = jest.fn();
const mockFoodExists = jest.fn();
const mockInsertFood = jest.fn();
const mockWeightExists = jest.fn();
const mockInsertWeight = jest.fn();
const mockSettingsExist = jest.fn();
const mockInsertSettings = jest.fn();

jest.mock('../dataRepository', () => ({
  dataRepository: {
    bloodSugarExists: (id: number) => mockBloodSugarExists(id),
    insertBloodSugar: (r: any) => mockInsertBloodSugar(r),
    foodExists: (id: number) => mockFoodExists(id),
    insertFood: (f: any) => mockInsertFood(f),
    weightExists: (id: number) => mockWeightExists(id),
    insertWeight: (w: any) => mockInsertWeight(w),
    settingsExist: () => mockSettingsExist(),
    insertSettings: (s: any) => mockInsertSettings(s),
  },
}));

const mockGetDocument = DocumentPicker.getDocumentAsync as jest.Mock;
const mockReadFile = FileSystem.readAsStringAsync as jest.Mock;

const validBackup = {
  version: 1,
  exportedAt: '2026-06-24T10:00:00.000Z',
  bloodSugarReadings: [
    { id: 1, valueMmol: 5.5, timestamp: '2026-06-17T08:30:00.000Z', context: 'fasting', notes: '' },
  ],
  foodEntries: [
    { id: 1, name: 'Oatmeal', category: 'breakfast', timestamp: '2026-06-17T08:00:00.000Z' },
  ],
  weightEntries: [
    { id: 1, valueKg: 82.4, timestamp: '2026-06-17T12:00:00.000Z', notes: '' },
  ],
  settings: { id: 1, userName: 'Tom', targetMinMmol: 3.9, targetMaxMmol: 7.8 },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockBloodSugarExists.mockReturnValue(false);
  mockFoodExists.mockReturnValue(false);
  mockWeightExists.mockReturnValue(false);
  mockSettingsExist.mockReturnValue(true);
  mockGetDocument.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///backup.json' }],
  });
  mockReadFile.mockResolvedValue(JSON.stringify(validBackup));
});

describe('importData', () => {
  it('returns cancelled when picker is dismissed', async () => {
    mockGetDocument.mockResolvedValue({ canceled: true });
    const result = await importData();
    expect(result).toEqual({ type: 'cancelled' });
  });

  it('returns error for malformed JSON', async () => {
    mockReadFile.mockResolvedValue('not valid json {{{');
    const result = await importData();
    expect(result).toEqual({ type: 'error' });
  });

  it('returns error for JSON missing required keys', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ version: 1, bloodSugarReadings: [] }));
    const result = await importData();
    expect(result).toEqual({ type: 'error' });
  });

  it('imports new records and returns correct count', async () => {
    const result = await importData();
    expect(result).toEqual({ type: 'success', count: 3 });
    expect(mockInsertBloodSugar).toHaveBeenCalledTimes(1);
    expect(mockInsertFood).toHaveBeenCalledTimes(1);
    expect(mockInsertWeight).toHaveBeenCalledTimes(1);
  });

  it('skips records that already exist', async () => {
    mockBloodSugarExists.mockReturnValue(true);
    mockFoodExists.mockReturnValue(true);
    mockWeightExists.mockReturnValue(true);

    const result = await importData();
    expect(result).toEqual({ type: 'success', count: 0 });
    expect(mockInsertBloodSugar).not.toHaveBeenCalled();
    expect(mockInsertFood).not.toHaveBeenCalled();
    expect(mockInsertWeight).not.toHaveBeenCalled();
  });

  it('does not import settings when settings already exist', async () => {
    mockSettingsExist.mockReturnValue(true);
    await importData();
    expect(mockInsertSettings).not.toHaveBeenCalled();
  });

  it('imports settings when they do not exist', async () => {
    mockSettingsExist.mockReturnValue(false);
    await importData();
    expect(mockInsertSettings).toHaveBeenCalledWith(validBackup.settings);
  });

  it('sets photoUri to null on imported food entries', async () => {
    await importData();
    expect(mockInsertFood).toHaveBeenCalledWith(
      expect.objectContaining({ photoUri: null }),
    );
  });
});
