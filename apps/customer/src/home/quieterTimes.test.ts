import { describe, expect, it } from 'vitest';
import { money } from '@quibo/contracts';
import { QUIETER_COUNT, quieterSaving, quieterWindows } from './quieterTimes';

const SLOTS = { firstHour: 7, lastEndHour: 22, leadMinutes: 30, full: [] };
const DELIVERY = {
  bands: [{ upToKm: 5, fee: money(1_200) }],
  rushHours: [
    { from: 8, to: 10 },
    { from: 17, to: 21 },
  ],
  rushExtra: money(400),
  festivalExtra: money(0),
  rainExtra: money(0),
  max: money(3_000),
};

describe('quieterWindows', () => {
  it('spreads the windows across the day from the first hour to the last', () => {
    const windows = quieterWindows(SLOTS, DELIVERY);
    expect(windows).toHaveLength(QUIETER_COUNT);
    expect(windows[0]?.hour).toBe(7);
    expect(windows[windows.length - 1]?.hour).toBe(21);
    const hours = windows.map((entry) => entry.hour);
    expect([...hours].sort((a, b) => a - b)).toEqual(hours);
  });

  it('saves the rush extra outside the rush hours and nothing inside them', () => {
    const windows = quieterWindows(SLOTS, DELIVERY);
    for (const entry of windows) {
      const rush = (entry.hour >= 8 && entry.hour < 10) || (entry.hour >= 17 && entry.hour < 21);
      expect(entry.save).toBe(rush ? undefined : 400);
    }
  });

  it('shows fewer windows when the day has fewer hours', () => {
    const short = { ...SLOTS, firstHour: 9, lastEndHour: 11 };
    expect(quieterWindows(short, DELIVERY).map((entry) => entry.hour)).toEqual([9, 10]);
  });

  it('is empty when the day has no hours', () => {
    expect(quieterWindows({ ...SLOTS, firstHour: 9, lastEndHour: 9 }, DELIVERY)).toEqual([]);
  });
});

describe('quieterSaving', () => {
  it('is the most any window saves', () => {
    expect(
      quieterSaving([
        { hour: 7, save: 400 },
        { hour: 12, save: undefined },
        { hour: 16, save: 600 },
      ]),
    ).toBe(600);
  });

  it('is nothing when every window is inside the rush hours', () => {
    expect(quieterSaving([{ hour: 8, save: undefined }])).toBe(0);
    expect(quieterSaving([])).toBe(0);
  });
});
