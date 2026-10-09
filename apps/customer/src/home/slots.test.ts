import { describe, expect, it } from 'vitest';
import type { SlotRules } from './delivery';
import {
  choiceFor,
  dateKey,
  earliestSlot,
  groupOf,
  parseChoice,
  periodOf,
  resolveChoice,
  serialiseChoice,
  slotsFor,
  windowParts,
} from './slots';

const rules: SlotRules = {
  firstHour: 7,
  lastEndHour: 21,
  leadMinutes: 60,
  full: ['today-18', 'tomorrow-8'],
};

/** 9 October 2026 at the given time, local. */
const at = (hour: number, minute = 0) => new Date(2026, 9, 9, hour, minute);

describe('windowParts', () => {
  it('puts both hours on a 12-hour dial and says when a window crosses noon', () => {
    expect(windowParts(17)).toMatchObject({
      from: 5,
      to: 6,
      period: 'evening',
      crossesNoon: false,
    });
    expect(windowParts(11)).toMatchObject({ from: 11, to: 12, crossesNoon: true });
    expect(windowParts(12)).toMatchObject({ from: 12, to: 1, period: 'afternoon' });
    expect(windowParts(7)).toMatchObject({ from: 7, to: 8, period: 'morning' });
    expect(windowParts(20)).toMatchObject({ from: 8, to: 9, period: 'night' });
  });
});

describe('groups and periods', () => {
  it('split the day at noon and 5 PM for the page, and at noon, 4 PM and 8 PM for the words', () => {
    expect([6, 11, 12, 16, 17, 20].map(groupOf)).toEqual([
      'morning',
      'morning',
      'afternoon',
      'afternoon',
      'evening',
      'evening',
    ]);
    expect([7, 12, 15, 16, 19, 20].map(periodOf)).toEqual([
      'morning',
      'afternoon',
      'afternoon',
      'evening',
      'evening',
      'night',
    ]);
  });
});

describe('slotsFor', () => {
  it('lists every hour of tomorrow, one hour each, from the first to the last window', () => {
    const tomorrow = slotsFor('tomorrow', at(15), rules);
    expect(tomorrow).toHaveLength(14);
    expect(tomorrow[0]?.hour).toBe(7);
    expect(tomorrow.at(-1)?.hour).toBe(20);
    expect(dateKey(tomorrow[0]?.date ?? new Date())).toBe('2026-10-10');
  });

  it('drops the windows that start sooner than the lead time from now', () => {
    // 3:20 PM plus an hour is 4:20 PM, so the 4 PM window is gone and 5 PM is the first.
    expect(slotsFor('today', at(15, 20), rules)[0]?.hour).toBe(17);
    // Exactly on the lead time still counts.
    expect(slotsFor('today', at(15, 0), rules)[0]?.hour).toBe(16);
  });

  it('is empty late in the day', () => {
    expect(slotsFor('today', at(19, 30), rules)).toEqual([]);
  });

  it('marks full windows without removing them', () => {
    const today = slotsFor('today', at(8), rules);
    expect(today.find((slot) => slot.hour === 18)?.full).toBe(true);
    expect(today.find((slot) => slot.hour === 17)?.full).toBe(false);
    expect(slotsFor('tomorrow', at(8), rules).find((slot) => slot.hour === 8)?.full).toBe(true);
  });
});

describe('earliestSlot', () => {
  it('is the first window today that is not full', () => {
    expect(earliestSlot(at(15, 20), rules)?.hour).toBe(17);
  });

  it('skips a full window', () => {
    // 4:30 PM plus an hour is 5:30 PM, so 6 PM is first; it is full, so 7 PM is.
    expect(earliestSlot(at(16, 30), rules)?.hour).toBe(19);
  });

  it('moves to tomorrow morning when nothing is left today', () => {
    const slot = earliestSlot(at(19, 30), rules);
    expect(slot?.day).toBe('tomorrow');
    expect(slot?.hour).toBe(7);
  });
});

describe('resolveChoice', () => {
  it('follows the earliest window as time passes', () => {
    expect(resolveChoice({ mode: 'earliest' }, at(10), rules).slot?.hour).toBe(11);
    expect(resolveChoice({ mode: 'earliest' }, at(13), rules).slot?.hour).toBe(14);
  });

  it('keeps a window that is still open', () => {
    const resolved = resolveChoice({ mode: 'slot', date: '2026-10-10', hour: 9 }, at(15), rules);
    expect(resolved.earliest).toBe(false);
    expect(resolved.slot).toMatchObject({ day: 'tomorrow', hour: 9 });
  });

  it('falls back to the earliest when the chosen window has passed, filled up, or never existed', () => {
    const passed = resolveChoice({ mode: 'slot', date: '2026-10-09', hour: 9 }, at(15), rules);
    expect(passed.earliest).toBe(true);
    expect(passed.slot?.hour).toBe(16);
    const full = resolveChoice({ mode: 'slot', date: '2026-10-10', hour: 8 }, at(15), rules);
    expect(full.earliest).toBe(true);
    const never = resolveChoice({ mode: 'slot', date: '2026-10-20', hour: 9 }, at(15), rules);
    expect(never.earliest).toBe(true);
  });

  it('meets a window chosen as tomorrow, once it is today, by the date and not the word', () => {
    const next = new Date(2026, 9, 10, 6, 0);
    const resolved = resolveChoice({ mode: 'slot', date: '2026-10-10', hour: 9 }, next, rules);
    expect(resolved.slot).toMatchObject({ day: 'today', hour: 9 });
  });
});

describe('saving a choice', () => {
  it('round-trips both kinds', () => {
    expect(parseChoice(serialiseChoice({ mode: 'earliest' }))).toEqual({ mode: 'earliest' });
    const slot = slotsFor('tomorrow', at(15), rules)[3];
    expect(slot).toBeDefined();
    if (slot === undefined) return;
    expect(parseChoice(serialiseChoice(choiceFor(slot)))).toEqual({
      mode: 'slot',
      date: '2026-10-10',
      hour: 10,
    });
  });

  it('reads anything unreadable as the earliest window', () => {
    const bad = [
      null,
      'nope',
      '{}',
      '[1]',
      '{"mode":"slot","date":"x","hour":9}',
      '{"mode":"slot","date":"2026-10-10","hour":9.5}',
    ];
    for (const saved of bad) expect(parseChoice(saved)).toEqual({ mode: 'earliest' });
  });
});
