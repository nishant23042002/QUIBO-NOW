import { z } from 'zod';

/**
 * Money is an integer number of paise (1 rupee = 100 paise). Never a float.
 *
 * The type is branded, so a plain `number` cannot be passed where Money is expected;
 * build one with `money()` or `MoneySchema.parse()`. It is signed on purpose: refunds
 * and ledger deltas are negative amounts.
 */
export const MoneySchema = z.int().brand<'Money'>();
export type Money = z.infer<typeof MoneySchema>;

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
const MIN_SAFE = BigInt(Number.MIN_SAFE_INTEGER);

/** Largest quantity precision: 3 decimals, enough for grams in a kilogram or millilitres in a litre. */
const QUANTITY_SCALE = 1000;

/** Create Money from integer paise. Throws a ZodError for floats, NaN, Infinity or unsafe integers. */
export function money(paise: number): Money {
  const parsed = MoneySchema.parse(paise);
  // Normalise -0 to 0 so equality checks and JSON behave.
  return Object.is(parsed, -0) ? MoneySchema.parse(0) : parsed;
}

function fromBigInt(value: bigint): Money {
  if (value > MAX_SAFE || value < MIN_SAFE) {
    throw new RangeError('Money amount is outside the safe integer range');
  }
  return money(Number(value));
}

/** a + b. Throws RangeError if the result leaves the safe integer range. */
export function add(a: Money, b: Money): Money {
  return fromBigInt(BigInt(a) + BigInt(b));
}

/** a - b. May be negative. Throws RangeError if the result leaves the safe integer range. */
export function subtract(a: Money, b: Money): Money {
  return fromBigInt(BigInt(a) - BigInt(b));
}

/**
 * unitPrice x quantity, rounded to whole paise, halves rounded away from zero
 * (0.5 paise becomes 1, -0.5 becomes -1).
 *
 * `quantity` may have up to 3 decimals (0.75 kg, 1.5 litre) and may be negative. More
 * decimals throw instead of being silently rounded. All arithmetic is integer (BigInt), so
 * binary floating-point error cannot change a price.
 */
export function multiplyByQuantity(unitPrice: Money, quantity: number): Money {
  if (!Number.isFinite(quantity)) {
    throw new RangeError('Quantity must be a finite number');
  }
  const scaled = Math.round(quantity * QUANTITY_SCALE);
  // A quantity such as 0.1 + 0.2 carries float noise far below 1e-6, so it is accepted as 0.3;
  // a real fourth decimal (0.0005) is off by 0.5 or more and is rejected.
  if (!Number.isSafeInteger(scaled) || Math.abs(quantity * QUANTITY_SCALE - scaled) > 1e-6) {
    throw new RangeError('Quantity may have at most 3 decimal places');
  }

  const product = BigInt(unitPrice) * BigInt(scaled);
  const scale = BigInt(QUANTITY_SCALE);
  const negative = product < 0n;
  const magnitude = negative ? -product : product;
  let rounded = magnitude / scale;
  if ((magnitude % scale) * 2n >= scale) rounded += 1n;
  return fromBigInt(negative ? -rounded : rounded);
}

export interface FormatRupeesOptions {
  /**
   * `auto` (default) omits ".00" for whole rupees: ₹49 and ₹49.50.
   * `always` shows two decimals every time: ₹49.00. Use it for bills and ledgers.
   */
  paise?: 'auto' | 'always';
}

const rupeeGrouping = new Intl.NumberFormat('en-IN', { numberingSystem: 'latn' });

/**
 * Format as rupees with Indian digit grouping and Latin digits, e.g. ₹1,23,456.50 and -₹5.
 * Only the whole-rupee part goes through Intl (as a BigInt) and the paise are appended as
 * integers, so no float is ever involved. Digits are Latin in every language; Marathi's
 * default would otherwise be Devanagari digits.
 */
export function formatRupees(amount: Money, options: FormatRupeesOptions = {}): string {
  const total = BigInt(amount);
  const negative = total < 0n;
  const magnitude = negative ? -total : total;
  const rupees = magnitude / 100n;
  const paise = Number(magnitude % 100n);

  const showPaise = options.paise === 'always' || paise !== 0;
  const fraction = showPaise ? `.${String(paise).padStart(2, '0')}` : '';
  return `${negative ? '-' : ''}₹${rupeeGrouping.format(rupees)}${fraction}`;
}
