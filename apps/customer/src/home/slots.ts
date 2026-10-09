import { addDays } from './dates';
import { ZONE, type SlotRules } from './delivery';

export type SlotDay = 'today' | 'tomorrow';
export type SlotGroup = 'morning' | 'afternoon' | 'evening';
/** The part of the day a window starts in, which decides the words round its hours ("AM", "सुबह" and so on). */
export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

/** One window of one hour on one day, for example 5 to 6 PM today. */
export interface Slot {
  /** For example "2026-10-09-17": the date, then the hour the window starts. */
  id: string;
  day: SlotDay;
  /** Midnight of the day the window is on. */
  date: Date;
  /** The hour the window starts, on a 24-hour clock. */
  hour: number;
  /** Full windows are shown but cannot be chosen. */
  full: boolean;
  group: SlotGroup;
}

/** What the shopper chose: the earliest window there is (whichever that is as time passes), or one particular window. */
export type SlotChoice =
  | { mode: 'earliest' }
  /** `date` is for example "2026-10-09". */
  | { mode: 'slot'; date: string; hour: number };

const pad = (value: number) => String(value).padStart(2, '0');

/** A date as "2026-10-09", in local time. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Which of the three groups on the schedule page a window belongs to: before noon, until 5 PM, and after. */
export function groupOf(hour: number): SlotGroup {
  if (hour < 12) return 'morning';
  return hour < 17 ? 'afternoon' : 'evening';
}

/** The part of the day a window starts in. */
export function periodOf(hour: number): DayPeriod {
  if (hour < 12) return 'morning';
  if (hour < 16) return 'afternoon';
  return hour < 20 ? 'evening' : 'night';
}

/** A 24-hour clock hour on a 12-hour dial: 0 and 12 are 12, 13 is 1. */
export function twelveHour(hour: number): number {
  return hour % 12 === 0 ? 12 : hour % 12;
}

/** The pieces of a window's label: the two hours on a 12-hour dial, and whether the window crosses noon (11 to 12). */
export function windowParts(hour: number): {
  from: number;
  to: number;
  period: DayPeriod;
  crossesNoon: boolean;
} {
  return {
    from: twelveHour(hour),
    to: twelveHour(hour + 1),
    period: periodOf(hour),
    crossesNoon: hour === 11,
  };
}

function makeSlot(day: SlotDay, date: Date, hour: number, rules: SlotRules): Slot {
  return {
    id: `${dateKey(date)}-${hour}`,
    day,
    date,
    hour,
    full: rules.full.includes(`${day}-${hour}`),
    group: groupOf(hour),
  };
}

/**
 * The windows still to come on a day, earliest first, full ones included (marked). Today's windows that start sooner
 * than the lead time from now are gone, because the shop could not pack in time; tomorrow has all of them.
 */
export function slotsFor(day: SlotDay, now: Date, rules: SlotRules = ZONE.slots): Slot[] {
  const date = addDays(now, day === 'today' ? 0 : 1);
  const earliestStart = now.getTime() + rules.leadMinutes * 60_000;
  const slots: Slot[] = [];
  for (let hour = rules.firstHour; hour < rules.lastEndHour; hour += 1) {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour).getTime();
    if (day === 'today' && start < earliestStart) continue;
    slots.push(makeSlot(day, date, hour, rules));
  }
  return slots;
}

/** The first window that is not full: today's if there is one, otherwise tomorrow's. */
export function earliestSlot(now: Date, rules: SlotRules = ZONE.slots): Slot | undefined {
  return (
    slotsFor('today', now, rules).find((slot) => !slot.full) ??
    slotsFor('tomorrow', now, rules).find((slot) => !slot.full)
  );
}

/**
 * The window a choice means right now, and whether it is the earliest one. A particular window that has since gone
 * (it is past, or it filled up) falls back to the earliest, so an order is never left waiting on a window that cannot
 * happen.
 */
export function resolveChoice(
  choice: SlotChoice,
  now: Date,
  rules: SlotRules = ZONE.slots,
): { slot: Slot | undefined; earliest: boolean } {
  if (choice.mode === 'slot') {
    for (const day of ['today', 'tomorrow'] as const) {
      const found = slotsFor(day, now, rules).find(
        (slot) => dateKey(slot.date) === choice.date && slot.hour === choice.hour && !slot.full,
      );
      if (found !== undefined) return { slot: found, earliest: false };
    }
  }
  return { slot: earliestSlot(now, rules), earliest: true };
}

/** A choice as text for the phone's storage. */
export function serialiseChoice(choice: SlotChoice): string {
  return JSON.stringify(choice);
}

/** A choice read back from storage. Anything unreadable is the earliest window, never a crash. */
export function parseChoice(saved: string | null): SlotChoice {
  const earliest: SlotChoice = { mode: 'earliest' };
  if (saved === null) return earliest;
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      parsed.mode === 'slot' &&
      typeof parsed.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) &&
      typeof parsed.hour === 'number' &&
      Number.isInteger(parsed.hour)
    ) {
      return { mode: 'slot', date: parsed.date, hour: parsed.hour };
    }
  } catch {
    // Not valid text: fall through to the earliest window.
  }
  return earliest;
}

/** The choice that means one particular window. */
export function choiceFor(slot: Slot): SlotChoice {
  return { mode: 'slot', date: dateKey(slot.date), hour: slot.hour };
}
