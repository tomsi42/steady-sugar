/** Parse "DD/MM/YYYY" → Date (local midnight). Returns null if invalid. */
export function parseDateText(text: string): Date | null {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = parseInt(match[1]!, 10);
  const month = parseInt(match[2]!, 10) - 1;
  const year = parseInt(match[3]!, 10);
  if (month < 0 || month > 11 || day < 1 || year < 2000 || year > 2100) return null;
  const d = new Date(year, month, day);
  if (d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}

/** Parse "HH:MM" (24 h) → { hours, minutes }. Returns null if invalid. */
export function parseTimeText(text: string): { hours: number; minutes: number } | null {
  const match = text.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1]!, 10);
  const minutes = parseInt(match[2]!, 10);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/** Format Date → "DD/MM/YYYY" */
export function formatDateText(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

/** Format Date → "HH:MM" (24 h) */
export function formatTimeText(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Auto-format raw digit input into DD/MM/YYYY as the user types.
 * Non-digits are stripped; slashes are inserted automatically.
 */
export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Auto-format raw digit input into HH:MM as the user types.
 * Non-digits are stripped; colon is inserted automatically.
 */
export function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
