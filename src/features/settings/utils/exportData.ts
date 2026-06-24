import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { dataRepository } from '../dataRepository';

export async function exportData(): Promise<void> {
  const readings = dataRepository.getAllBloodSugar();
  const food = dataRepository.getAllFood();
  const weight = dataRepository.getAllWeight();
  const settings = dataRepository.getSettings();

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    bloodSugarReadings: readings.map((r) => ({
      id: r.id,
      valueMmol: r.valueMmol,
      timestamp: r.timestamp.getTime(),
      context: r.context,
      notes: r.notes ?? '',
    })),
    foodEntries: food.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      timestamp: f.timestamp.getTime(),
      // photo_uri intentionally excluded
    })),
    weightEntries: weight.map((w) => ({
      id: w.id,
      valueKg: w.valueKg,
      timestamp: w.timestamp.getTime(),
      notes: w.notes ?? '',
    })),
    settings: settings
      ? {
          id: settings.id,
          userName: settings.userName,
          targetMinMmol: settings.targetMinMmol,
          targetMaxMmol: settings.targetMaxMmol,
        }
      : null,
  };

  const json = JSON.stringify(payload, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `SugarWise-backup-${date}.json`;
  const path = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(path, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, {
    mimeType: 'application/json',
    dialogTitle: 'Save SugarWise backup',
  });
}
