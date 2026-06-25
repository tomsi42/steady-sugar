import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { dataRepository } from '../dataRepository';

export async function exportData(): Promise<void> {
  const readings = await dataRepository.getAllBloodSugar();
  const food = await dataRepository.getAllFood();
  const weight = await dataRepository.getAllWeight();
  const settings = await dataRepository.getSettings();

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    bloodSugarReadings: readings.map((r) => ({
      id: r.id,
      valueMmol: r.valueMmol,
      timestamp: r.timestamp.toISOString(),
      context: r.context,
      notes: r.notes ?? '',
    })),
    foodEntries: food.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      timestamp: f.timestamp.toISOString(),
      // photo_uri intentionally excluded
    })),
    weightEntries: weight.map((w) => ({
      id: w.id,
      valueKg: w.valueKg,
      timestamp: w.timestamp.toISOString(),
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
  const filename = `SteadySugar-backup-${date}.json`;

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } else {
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: 'Save SteadySugar backup',
    });
  }
}
