import { multiplyByQuantity, money, subtract, type Money } from '@quibo/contracts';

/** What a weighed line ends up costing, once the shop has put it on the scale. */
export interface WeighedSettlement {
  /** What the line is billed at. */
  charge: Money;
  /** What goes back to the customer when the packed weight is lighter than what they asked for. */
  refund: Money;
  /** What the customer pays on top of the estimate when the packed weight is a little heavier. */
  extra: Money;
}

/**
 * Settles a loose item after weighing. The customer pays for the weight that is actually packed, so a lighter pack is
 * refunded the difference, and a heavier one costs a little more, but never for more than the ordered weight plus the
 * tolerance (the shop absorbs the rest). Weights are in kilograms, up to three decimals, and money in integer paise.
 */
export function settleWeight(
  orderedKg: number,
  actualKg: number,
  pricePerKg: Money,
  tolerancePercent: number,
): WeighedSettlement {
  const ceiling = orderedKg * (1 + tolerancePercent / 100);
  const billedKg = Math.round(Math.min(actualKg, ceiling) * 1000) / 1000;
  const estimate = multiplyByQuantity(pricePerKg, orderedKg);
  const charge = multiplyByQuantity(pricePerKg, billedKg);
  const zero = money(0);
  return {
    charge,
    refund: charge < estimate ? subtract(estimate, charge) : zero,
    extra: charge > estimate ? subtract(charge, estimate) : zero,
  };
}
