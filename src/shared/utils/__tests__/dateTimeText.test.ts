import {
  parseDateText,
  parseTimeText,
  formatDateText,
  formatTimeText,
  formatDateInput,
  formatTimeInput,
} from '../dateTimeText';

describe('parseDateText', () => {
  it('parses a valid date', () => {
    const d = parseDateText('23/06/2026');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(5); // June = 5
    expect(d!.getDate()).toBe(23);
  });

  it('returns null for wrong format', () => {
    expect(parseDateText('2026-06-23')).toBeNull();
    expect(parseDateText('06/23/2026')).toBeNull(); // rejected — day 6 month 23 invalid
    expect(parseDateText('23/6/2026')).toBeNull();  // single-digit month
    expect(parseDateText('')).toBeNull();
  });

  it('returns null for impossible calendar dates', () => {
    expect(parseDateText('30/02/2026')).toBeNull(); // Feb 30
    expect(parseDateText('31/04/2026')).toBeNull(); // April has 30 days
  });

  it('accepts Feb 29 on a leap year', () => {
    expect(parseDateText('29/02/2024')).not.toBeNull();
  });

  it('returns null for Feb 29 on a non-leap year', () => {
    expect(parseDateText('29/02/2026')).toBeNull();
  });

  it('returns null for years outside 2000–2100', () => {
    expect(parseDateText('01/01/1999')).toBeNull();
    expect(parseDateText('01/01/2101')).toBeNull();
  });
});

describe('parseTimeText', () => {
  it('parses a valid time', () => {
    const t = parseTimeText('14:30');
    expect(t).not.toBeNull();
    expect(t!.hours).toBe(14);
    expect(t!.minutes).toBe(30);
  });

  it('parses midnight and end-of-day correctly', () => {
    expect(parseTimeText('00:00')).toEqual({ hours: 0, minutes: 0 });
    expect(parseTimeText('23:59')).toEqual({ hours: 23, minutes: 59 });
  });

  it('returns null for invalid time', () => {
    expect(parseTimeText('24:00')).toBeNull();
    expect(parseTimeText('12:60')).toBeNull();
    expect(parseTimeText('1:30')).toBeNull();  // single-digit hour
    expect(parseTimeText('14:3')).toBeNull();  // single-digit minute
    expect(parseTimeText('')).toBeNull();
  });
});

describe('formatDateText', () => {
  it('formats a date as DD/MM/YYYY with zero-padding', () => {
    expect(formatDateText(new Date(2026, 5, 3))).toBe('03/06/2026');
    expect(formatDateText(new Date(2026, 11, 23))).toBe('23/12/2026');
  });
});

describe('formatTimeText', () => {
  it('formats time as HH:MM with zero-padding', () => {
    expect(formatTimeText(new Date(2026, 5, 23, 8, 5))).toBe('08:05');
    expect(formatTimeText(new Date(2026, 5, 23, 14, 30))).toBe('14:30');
  });
});

describe('formatDateInput', () => {
  it('passes through up to 2 digits unchanged', () => {
    expect(formatDateInput('2')).toBe('2');
    expect(formatDateInput('23')).toBe('23');
  });

  it('inserts slash after day digits', () => {
    expect(formatDateInput('230')).toBe('23/0');
    expect(formatDateInput('2306')).toBe('23/06');
  });

  it('inserts second slash after month digits', () => {
    expect(formatDateInput('23062')).toBe('23/06/2');
    expect(formatDateInput('23062026')).toBe('23/06/2026');
  });

  it('strips non-digit characters', () => {
    expect(formatDateInput('23/06/2026')).toBe('23/06/2026');
    expect(formatDateInput('23-06-2026')).toBe('23/06/2026');
  });

  it('truncates beyond 8 digits', () => {
    expect(formatDateInput('230620261')).toBe('23/06/2026');
  });
});

describe('formatTimeInput', () => {
  it('passes through up to 2 digits unchanged', () => {
    expect(formatTimeInput('1')).toBe('1');
    expect(formatTimeInput('14')).toBe('14');
  });

  it('inserts colon after hour digits', () => {
    expect(formatTimeInput('143')).toBe('14:3');
    expect(formatTimeInput('1430')).toBe('14:30');
  });

  it('strips non-digit characters', () => {
    expect(formatTimeInput('14:30')).toBe('14:30');
  });

  it('truncates beyond 4 digits', () => {
    expect(formatTimeInput('14305')).toBe('14:30');
  });
});
