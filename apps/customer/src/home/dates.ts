/** A day moved forward (or back, with a negative number), at local midnight so the time of day never matters. */
export function addDays(from: Date, days: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
}

/**
 * A date moved forward by whole months. When the day does not exist in the new month (31 January plus a month),
 * it lands on the last day of that month, never in the month after.
 */
export function addMonths(from: Date, months: number): Date {
  const first = new Date(from.getFullYear(), from.getMonth() + months, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(from.getDate(), lastDay));
}

/** A date as "9 Oct 2026", with the month named by the caller (in the app's language) and Latin digits. */
export function formatDay(date: Date, monthNames: readonly string[]): string {
  return `${date.getDate()} ${monthNames[date.getMonth()] ?? ''} ${date.getFullYear()}`;
}
