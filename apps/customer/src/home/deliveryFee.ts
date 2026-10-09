import { add, money, type Money } from '@quibo/contracts';
import { ZONE, type DeliveryRules } from './delivery';

/** What the trip is like: how far, when, and whether the day or the weather makes it harder. */
export interface TripConditions {
  distanceKm: number;
  /** The hour of the day the order is delivered, 0 to 23. */
  hour: number;
  festival: boolean;
  rain: boolean;
  /** Treat this trip as rush hour whatever the clock says (a test switch). */
  rush?: boolean;
}

/** The delivery fee and what it is made of, so the customer can be shown why. All integer paise. */
export interface DeliveryFee {
  /** The base fee for the distance. */
  distance: Money;
  rush: Money;
  festival: Money;
  rain: Money;
  /** What is charged: the parts added up, but never more than the zone's top fee. */
  fee: Money;
  /** True when the parts add up to more than the top fee and it was held down to it. */
  capped: boolean;
}

const ZERO = money(0);

/** Whether an hour of the day falls in one of the rush windows. */
export function isRushHour(hour: number, rules: DeliveryRules = ZONE.delivery): boolean {
  return rules.rushHours.some((window) => hour >= window.from && hour < window.to);
}

/**
 * What delivery costs for this trip. The base comes from the distance band; rush hour, a festival day and rain each
 * add a set amount; and the total never goes above the zone's top fee.
 */
export function deliveryFee(
  trip: TripConditions,
  rules: DeliveryRules = ZONE.delivery,
): DeliveryFee {
  const band =
    rules.bands.find((candidate) => trip.distanceKm <= candidate.upToKm) ?? rules.bands.at(-1);
  const distance = band?.fee ?? ZERO;
  const rush = trip.rush === true || isRushHour(trip.hour, rules) ? rules.rushExtra : ZERO;
  const festival = trip.festival ? rules.festivalExtra : ZERO;
  const rain = trip.rain ? rules.rainExtra : ZERO;
  const total = add(add(add(distance, rush), festival), rain);
  const capped = total > rules.max;
  return { distance, rush, festival, rain, fee: capped ? rules.max : total, capped };
}
