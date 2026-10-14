/**
 * When the last moment screen began, for this run of the app: the launch counts, so a fact never comes up straight after it. The
 * moment screens (launch, a fact, an order placed) share this one clock so none of them can follow another too closely.
 */
let last: number | null = Date.now();

/** A moment screen has just begun. */
export function markMoment(): void {
  last = Date.now();
}

/** When the last moment began, or null when none has. */
export function lastMomentAt(): number | null {
  return last;
}
