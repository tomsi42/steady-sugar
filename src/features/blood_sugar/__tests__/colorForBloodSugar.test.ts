import { colorForBloodSugar } from '../utils/colorForBloodSugar';

describe('colorForBloodSugar', () => {
  it('returns red for values below 3.9 (hypoglycemia)', () => {
    expect(colorForBloodSugar(1.0)).toBe('#E53935');
    expect(colorForBloodSugar(3.8)).toBe('#E53935');
    expect(colorForBloodSugar(0)).toBe('#E53935');
  });

  it('returns green for values in 3.9–7.8 (target range)', () => {
    expect(colorForBloodSugar(3.9)).toBe('#4CAF50');
    expect(colorForBloodSugar(5.5)).toBe('#4CAF50');
    expect(colorForBloodSugar(7.8)).toBe('#4CAF50');
  });

  it('returns yellow for values in 7.9–13.2 (elevated)', () => {
    expect(colorForBloodSugar(7.9)).toBe('#FFB300');
    expect(colorForBloodSugar(10.0)).toBe('#FFB300');
    expect(colorForBloodSugar(13.2)).toBe('#FFB300');
  });

  it('returns red for values >= 13.3 (dangerously high)', () => {
    expect(colorForBloodSugar(13.3)).toBe('#E53935');
    expect(colorForBloodSugar(20.0)).toBe('#E53935');
    expect(colorForBloodSugar(35.0)).toBe('#E53935');
  });
});
