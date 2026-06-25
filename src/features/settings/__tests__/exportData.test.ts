import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportData } from '../utils/exportData';

const mockGetAllBloodSugar = jest.fn();
const mockGetAllFood = jest.fn();
const mockGetAllWeight = jest.fn();
const mockGetSettings = jest.fn();

jest.mock('../dataRepository', () => ({
  dataRepository: {
    getAllBloodSugar: () => mockGetAllBloodSugar(),
    getAllFood: () => mockGetAllFood(),
    getAllWeight: () => mockGetAllWeight(),
    getSettings: () => mockGetSettings(),
  },
}));

const mockWriteFile = FileSystem.writeAsStringAsync as jest.Mock;
const mockShare = Sharing.shareAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAllBloodSugar.mockReturnValue([]);
  mockGetAllFood.mockReturnValue([]);
  mockGetAllWeight.mockReturnValue([]);
  mockGetSettings.mockReturnValue(null);
});

describe('exportData', () => {
  it('writes a JSON file and opens the share sheet', async () => {
    await exportData();
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledTimes(1);
  });

  it('exports blood sugar readings correctly', async () => {
    const ts = new Date('2026-06-17T08:30:00');
    mockGetAllBloodSugar.mockReturnValue([
      { id: 1, valueMmol: 5.5, timestamp: ts, context: 'fasting', notes: '' },
    ]);

    await exportData();

    const json = JSON.parse(mockWriteFile.mock.calls[0][1]);
    expect(json.version).toBe(1);
    expect(json.bloodSugarReadings).toHaveLength(1);
    expect(json.bloodSugarReadings[0]).toEqual({
      id: 1,
      valueMmol: 5.5,
      timestamp: ts.toISOString(),
      context: 'fasting',
      notes: '',
    });
  });

  it('excludes photo_uri from food entries', async () => {
    const ts = new Date('2026-06-17T08:00:00');
    mockGetAllFood.mockReturnValue([
      { id: 1, name: 'Oatmeal', category: 'breakfast', timestamp: ts, photoUri: 'file:///photo.jpg' },
    ]);

    await exportData();

    const json = JSON.parse(mockWriteFile.mock.calls[0][1]);
    expect(json.foodEntries[0]).not.toHaveProperty('photoUri');
    expect(json.foodEntries[0]).not.toHaveProperty('photo_uri');
  });

  it('exports weight entries correctly', async () => {
    const ts = new Date('2026-06-17T12:00:00');
    mockGetAllWeight.mockReturnValue([
      { id: 1, valueKg: 82.4, timestamp: ts, notes: 'after workout' },
    ]);

    await exportData();

    const json = JSON.parse(mockWriteFile.mock.calls[0][1]);
    expect(json.weightEntries[0]).toEqual({
      id: 1,
      valueKg: 82.4,
      timestamp: ts.toISOString(),
      notes: 'after workout',
    });
  });

  it('uses a filename containing the current date', async () => {
    await exportData();
    const path: string = mockWriteFile.mock.calls[0][0];
    expect(path).toMatch(/SteadySugar-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
