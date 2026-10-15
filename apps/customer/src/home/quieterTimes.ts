import { ZONE, type DeliveryRules, type SlotRules } from './delivery';
import { isRushHour } from './deliveryFee';

/**
 * "Quieter times" on Home (ADR 0055, step 8): a few delivery windows spread across the day, each marked with what it saves against
 * a rush-hour window, from the town's own rules. Plain code with no React in it. It says a saving only where there is one: a window
 * inside the rush hours has none, and says so.
 */
export interface QuieterWindow {
  /** The hour the one-hour window starts, on a 24-hour clock. */
  hour: number;
  /** What the window saves against a rush-hour one, in paise, or undefined for a window inside the rush hours. */
  save: number | undefined;
}

/** How many windows the module shows. */
export const QUIETER_COUNT = 4;

/**
 * Up to `count` windows spread evenly from the first hour of the day to the last, with the saving of each. The saving is the town's
 * rush extra, and only a window outside the rush hours has it.
 */
export function quieterWindows(
  slots: SlotRules = ZONE.slots,
  delivery: DeliveryRules = ZONE.delivery,
  count: number = QUIETER_COUNT,
): QuieterWindow[] {
  const hours: number[] = [];
  for (let hour = slots.firstHour; hour < slots.lastEndHour; hour += 1) hours.push(hour);
  if (hours.length === 0) return [];
  const picked = new Set<number>();
  const steps = Math.min(count, hours.length);
  for (let index = 0; index < steps; index += 1) {
    const at = steps === 1 ? 0 : Math.round((index * (hours.length - 1)) / (steps - 1));
    const hour = hours[at];
    if (hour !== undefined) picked.add(hour);
  }
  return [...picked].map((hour) => ({
    hour,
    save: isRushHour(hour, delivery) ? undefined : Number(delivery.rushExtra),
  }));
}

/** The most any window saves, in paise, for the strip's chip. Nothing (0) when no window is outside the rush hours. */
export function quieterSaving(windows: readonly QuieterWindow[] = quieterWindows()): number {
  return windows.reduce((most, entry) => Math.max(most, entry.save ?? 0), 0);
}
