import { desc, eq } from 'drizzle-orm';
import { db } from '../../shared/database/client';
import {
  bloodSugarReadings,
  type BloodSugarReading,
  type NewBloodSugarReading,
} from '../../shared/database/schema';

export const bloodSugarRepository = {
  getAll: (): BloodSugarReading[] =>
    db.select().from(bloodSugarReadings).orderBy(desc(bloodSugarReadings.timestamp)).all(),

  insert: (data: Omit<NewBloodSugarReading, 'id'>): BloodSugarReading =>
    db.insert(bloodSugarReadings).values(data).returning().get(),

  update: (id: number, data: Partial<Omit<NewBloodSugarReading, 'id'>>): BloodSugarReading =>
    db.update(bloodSugarReadings).set(data).where(eq(bloodSugarReadings.id, id)).returning().get(),

  delete: (id: number): void => {
    db.delete(bloodSugarReadings).where(eq(bloodSugarReadings.id, id)).run();
  },
};
