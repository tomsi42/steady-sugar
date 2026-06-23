import { db } from '../../shared/database/client';
import {
  appSettings,
  bloodSugarReadings,
  foodEntries,
  weightEntries,
  type AppSettings,
} from '../../shared/database/schema';

export const settingsRepository = {
  get: (): AppSettings | null => db.select().from(appSettings).get() ?? null,

  upsert: (data: Omit<AppSettings, 'id'>): AppSettings =>
    db
      .insert(appSettings)
      .values({ id: 1, ...data })
      .onConflictDoUpdate({ target: appSettings.id, set: data })
      .returning()
      .get(),

  clearAll: (): void => {
    db.delete(bloodSugarReadings).run();
    db.delete(foodEntries).run();
    db.delete(weightEntries).run();
    db.delete(appSettings).run();
  },
};
