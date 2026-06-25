import React from 'react';
import type { DateTimeInputProps } from './DateTimeInput';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputStyle: React.CSSProperties = {
  fontSize: 16,
  padding: '6px 10px',
  borderRadius: 4,
  border: '1px solid #BDBDBD',
  color: '#212121',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
};

export function DateTimeInput({ value, mode, maximumDate, onChange, testID }: DateTimeInputProps) {
  if (mode === 'date') {
    return (
      <input
        type="date"
        value={formatDate(value)}
        max={maximumDate ? formatDate(maximumDate) : undefined}
        onChange={(e) => {
          if (!e.target.value) return;
          const [y, m, d] = e.target.value.split('-').map(Number);
          const next = new Date(value);
          next.setFullYear(y, m - 1, d);
          onChange(next);
        }}
        style={inputStyle}
        data-testid={testID}
      />
    );
  }
  return (
    <input
      type="time"
      value={formatTime(value)}
      max={maximumDate ? formatTime(maximumDate) : undefined}
      onChange={(e) => {
        if (!e.target.value) return;
        const [h, min] = e.target.value.split(':').map(Number);
        const next = new Date(value);
        next.setHours(h, min, 0, 0);
        onChange(next);
      }}
      style={inputStyle}
      data-testid={testID}
    />
  );
}
