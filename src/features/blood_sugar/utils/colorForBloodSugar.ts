export function colorForBloodSugar(value: number): string {
  if (value < 3.9) return '#E53935';
  if (value <= 7.8) return '#4CAF50';
  if (value < 13.3) return '#FFB300';
  return '#E53935';
}
