/**
 * How much of an item is in the cart. 0 means "not in the cart" (the ADD button shows); anything
 * else is at least `min`. Counts step by 1, loose items by 0.5 kg. Arithmetic is done in
 * thousandths so 0.1 + 0.2 style float noise can never change a quantity.
 */
export interface QuantityRule {
  /** The smallest amount that can be in the cart: 1 for a count, 0.5 for loose weight. */
  min: number;
  step: number;
  max: number;
}

export const COUNT_RULE: QuantityRule = { min: 1, step: 1, max: 20 };
export const WEIGHT_RULE: QuantityRule = { min: 0.5, step: 0.5, max: 10 };

/**
 * The rule for something sold by the piece when only some are in stock: the same as `COUNT_RULE`, but never above the
 * number in stock. With no stock figure it is `COUNT_RULE` itself.
 */
export function countRule(inStock?: number): QuantityRule {
  if (inStock === undefined) return COUNT_RULE;
  return {
    ...COUNT_RULE,
    max: Math.max(COUNT_RULE.min, Math.min(Math.floor(inStock), COUNT_RULE.max)),
  };
}

const SCALE = 1000;
const thousandths = (n: number) => Math.round(n * SCALE);

/** The next quantity after a tap on + (direction 1) or - (direction -1). */
export function stepQuantity(value: number, direction: 1 | -1, rule: QuantityRule): number {
  const current = thousandths(value);
  const step = thousandths(rule.step);
  const min = thousandths(rule.min);
  const max = thousandths(rule.max);

  if (direction === 1) {
    if (current < min) return rule.min;
    return Math.min(current + step, max) / SCALE;
  }
  const next = current - step;
  return next < min ? 0 : next / SCALE;
}

/** A quantity as text with Latin digits and no trailing zeros: 1, 0.5, 2.25. */
export function formatQuantity(value: number): string {
  return String(Number(value.toFixed(3)));
}
