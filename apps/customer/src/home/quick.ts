import { ZONE, type QuickRules } from './delivery';
import { isRushHour, type TripConditions } from './deliveryFee';

/** How long quick delivery is estimated to take, as a range of minutes. */
export interface QuickEta {
  from: number;
  to: number;
}

/**
 * The estimated time for quick delivery: packing, then the ride (more for a longer trip), a little more for a big
 * order, and more again in a rush hour, on a festival day or in rain. It is rounded down to a step and shown as a range
 * one step wide ("10 to 15"), and never above the zone's top. It is an estimate, not a promise.
 */
export function quickEta(
  trip: TripConditions & { items: number },
  rules: QuickRules = ZONE.quick,
): QuickEta {
  const itemExtra = Math.min(
    rules.maxItemExtra,
    Math.floor(Math.max(0, trip.items - 1) / 4) * rules.extraPerFourItems,
  );
  const rush = trip.rush === true || isRushHour(trip.hour);
  const minutes = Math.min(
    rules.maxMinutes,
    rules.baseMinutes +
      trip.distanceKm * rules.perKm +
      itemExtra +
      (rush ? rules.rushExtra : 0) +
      (trip.rain ? rules.rainExtra : 0) +
      (trip.festival ? rules.festivalExtra : 0),
  );
  const from = Math.max(rules.step, Math.floor(minutes / rules.step) * rules.step);
  return { from, to: from + rules.step };
}
