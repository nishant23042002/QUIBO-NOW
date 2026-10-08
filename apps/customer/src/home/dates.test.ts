import { describe, expect, it } from 'vitest';
import { addDays, addMonths, formatDay } from './dates';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (date: Date) => formatDay(date, MONTHS);

describe('addDays', () => {
  it('moves forward across a month and a year end', () => {
    expect(day(addDays(new Date(2026, 9, 9), 5))).toBe('14 Oct 2026');
    expect(day(addDays(new Date(2026, 9, 30), 3))).toBe('2 Nov 2026');
    expect(day(addDays(new Date(2026, 11, 30), 3))).toBe('2 Jan 2027');
  });

  it('moves back with a negative number, and zero stays put', () => {
    expect(day(addDays(new Date(2026, 9, 9), -14))).toBe('25 Sep 2026');
    expect(day(addDays(new Date(2026, 9, 9), 0))).toBe('9 Oct 2026');
  });

  it('counts a leap day', () => {
    expect(day(addDays(new Date(2028, 1, 28), 1))).toBe('29 Feb 2028');
    expect(day(addDays(new Date(2026, 1, 28), 1))).toBe('1 Mar 2026');
  });
});

describe('addMonths', () => {
  it('keeps the day of the month when it exists', () => {
    expect(day(addMonths(new Date(2026, 9, 9), 3))).toBe('9 Jan 2027');
    expect(day(addMonths(new Date(2026, 9, 9), 12))).toBe('9 Oct 2027');
  });

  it('lands on the last day of a shorter month, not the month after', () => {
    expect(day(addMonths(new Date(2026, 0, 31), 1))).toBe('28 Feb 2026');
    expect(day(addMonths(new Date(2028, 0, 31), 1))).toBe('29 Feb 2028');
    expect(day(addMonths(new Date(2026, 7, 31), 1))).toBe('30 Sep 2026');
  });
});

describe('formatDay', () => {
  it('writes the day, the named month and the year, with Latin digits', () => {
    expect(day(new Date(2026, 0, 5))).toBe('5 Jan 2026');
  });
});
