import { money, subtract, type Money } from '@quibo/contracts';

/** How much cheaper the price is than the printed price (MRP), or null when it is not cheaper. */
export function savings(price: Money, mrp: Money): Money | null {
  return mrp > price ? subtract(mrp, price) : null;
}

export interface FreeDeliveryProgress {
  /** 0 to 1, for the progress bar. */
  ratio: number;
  /** How much more to add to reach free delivery. Zero once reached. */
  remaining: Money;
  reached: boolean;
}

/** How far a basket is from the free-delivery threshold. A threshold of zero or less is always reached. */
export function freeDeliveryProgress(basket: Money, threshold: Money): FreeDeliveryProgress {
  if (threshold <= 0 || basket >= threshold) {
    return { ratio: 1, remaining: money(0), reached: true };
  }
  const floor = basket < 0 ? money(0) : basket;
  return { ratio: floor / threshold, remaining: subtract(threshold, floor), reached: false };
}
