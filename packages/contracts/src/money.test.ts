import { describe, expect, it } from 'vitest';
import { MoneySchema, add, formatRupees, money, multiplyByQuantity, subtract } from './money';

const MAX = Number.MAX_SAFE_INTEGER;
const MIN = Number.MIN_SAFE_INTEGER;

describe('money()', () => {
  it.each([0, 1, -1, 4999, MAX, MIN])('accepts the integer %d', (paise) => {
    expect(money(paise)).toBe(paise);
  });

  it.each([1.5, 0.1, NaN, Infinity, -Infinity, MAX + 2, '100', null, undefined, {}])(
    'rejects %j',
    (bad) => {
      expect(() => money(bad as number)).toThrow();
      expect(MoneySchema.safeParse(bad).success).toBe(false);
    },
  );

  it('normalises negative zero to zero', () => {
    expect(Object.is(money(-0), 0)).toBe(true);
  });

  it('is not assignable from a plain number at compile time', () => {
    const plain = 5;
    // @ts-expect-error a plain number is not Money; only money() or MoneySchema.parse() makes one
    add(plain, money(1));
  });
});

describe('add', () => {
  it('adds two amounts', () => {
    expect(add(money(100), money(250))).toBe(350);
    expect(add(money(250), money(100))).toBe(350);
  });

  it('handles negative amounts', () => {
    expect(add(money(100), money(-250))).toBe(-150);
    expect(add(money(-100), money(-250))).toBe(-350);
  });

  it('has zero as identity', () => {
    expect(add(money(4999), money(0))).toBe(4999);
  });

  it('throws RangeError when the result leaves the safe integer range', () => {
    expect(() => add(money(MAX), money(1))).toThrow(RangeError);
    expect(() => add(money(MIN), money(-1))).toThrow(RangeError);
  });
});

describe('subtract', () => {
  it('subtracts and may go negative', () => {
    expect(subtract(money(250), money(100))).toBe(150);
    expect(subtract(money(100), money(250))).toBe(-150);
  });

  it('returns a clean zero, never negative zero', () => {
    expect(Object.is(subtract(money(500), money(500)), 0)).toBe(true);
  });

  it('subtracting a negative adds', () => {
    expect(subtract(money(100), money(-50))).toBe(150);
  });

  it('throws RangeError when the result leaves the safe integer range', () => {
    expect(() => subtract(money(MIN), money(1))).toThrow(RangeError);
    expect(() => subtract(money(MAX), money(-1))).toThrow(RangeError);
  });
});

describe('multiplyByQuantity', () => {
  it('multiplies by a whole quantity', () => {
    expect(multiplyByQuantity(money(4999), 3)).toBe(14997);
    expect(multiplyByQuantity(money(4999), 1)).toBe(4999);
  });

  it('multiplies by a loose weight', () => {
    // Rs 79.00 per kg, 0.75 kg
    expect(multiplyByQuantity(money(7900), 0.75)).toBe(5925);
  });

  it('returns zero for zero quantity', () => {
    expect(Object.is(multiplyByQuantity(money(4999), 0), 0)).toBe(true);
  });

  describe('rounding: halves go away from zero, everything else to the nearest paise', () => {
    it.each([
      // [unit price in paise, quantity, expected paise, working]
      [1, 0.5, 1, '0.5 rounds up'],
      [3, 0.5, 2, '1.5 rounds up'],
      [5, 0.1, 1, '0.5 rounds up'],
      [2, 0.25, 1, '0.5 rounds up'],
      [4500, 0.333, 1499, '1498.5 rounds up'],
      [999, 1.001, 1000, '999.999 rounds up'],
      [1, 0.499, 0, '0.499 rounds down'],
      [1, 0.001, 0, '0.001 rounds down'],
      [3, 0.333, 1, '0.999 rounds up'],
      [-1, 0.5, -1, '-0.5 rounds away from zero'],
      [-3, 0.5, -2, '-1.5 rounds away from zero'],
      [3, -0.5, -2, '-1.5 rounds away from zero'],
      [-3, -0.5, 2, '1.5 rounds away from zero'],
      [-1, 0.499, 0, '-0.499 rounds toward zero'],
    ])('%d paise x %d = %d (%s)', (price, quantity, expected) => {
      const result = multiplyByQuantity(money(price), quantity);
      expect(result).toBe(expected);
      expect(Number.isInteger(result)).toBe(true);
      // Never a negative zero.
      expect(Object.is(result, -0)).toBe(false);
    });
  });

  it('supports a negative quantity, for returns', () => {
    expect(multiplyByQuantity(money(4999), -2)).toBe(-9998);
  });

  it('is exact where floating-point multiplication is not', () => {
    // 1.005 kg is not exactly representable as a float; the result must still be exact.
    expect(multiplyByQuantity(money(10000), 1.005)).toBe(10050);
    // 0.1 + 0.2 is 0.30000000000000004 as a float but means 0.3 kg.
    expect(multiplyByQuantity(money(1000), 0.1 + 0.2)).toBe(300);
  });

  it.each([0.0005, 1.2345, 0.0001, 2.0004])('rejects %d: more than 3 decimal places', (bad) => {
    expect(() => multiplyByQuantity(money(100), bad)).toThrow(RangeError);
  });

  it.each([NaN, Infinity, -Infinity])('rejects the non-finite quantity %d', (bad) => {
    expect(() => multiplyByQuantity(money(100), bad)).toThrow(RangeError);
  });

  it('throws RangeError instead of returning an unsafe amount', () => {
    expect(() => multiplyByQuantity(money(MAX), 2)).toThrow(RangeError);
    expect(() => multiplyByQuantity(money(100), 1e13)).toThrow(RangeError);
  });
});

describe('formatRupees', () => {
  it.each([
    [0, '₹0'],
    [5, '₹0.05'],
    [99, '₹0.99'],
    [100, '₹1'],
    [4950, '₹49.50'],
    [99900, '₹999'],
    [100000, '₹1,000'],
    [12345650, '₹1,23,456.50'],
    [100000000, '₹10,00,000'],
    [1234567890, '₹1,23,45,678.90'],
    [MAX, '₹9,00,71,99,25,47,409.91'],
  ])('formats %d paise as %s', (paise, expected) => {
    expect(formatRupees(money(paise))).toBe(expected);
  });

  it('formats negative amounts with a leading minus', () => {
    expect(formatRupees(money(-500))).toBe('-₹5');
    expect(formatRupees(money(-5))).toBe('-₹0.05');
    expect(formatRupees(money(-12345650))).toBe('-₹1,23,456.50');
  });

  it('shows two decimals every time with paise: always', () => {
    expect(formatRupees(money(0), { paise: 'always' })).toBe('₹0.00');
    expect(formatRupees(money(100), { paise: 'always' })).toBe('₹1.00');
    expect(formatRupees(money(-500), { paise: 'always' })).toBe('-₹5.00');
    expect(formatRupees(money(12345650), { paise: 'always' })).toBe('₹1,23,456.50');
  });

  it('uses Latin digits and ASCII separators only', () => {
    for (const paise of [0, 1, 99, 100, 123456789, -987654321, MAX, MIN]) {
      expect(formatRupees(money(paise))).toMatch(/^-?₹[0-9,]+(\.[0-9]{2})?$/);
    }
  });

  it('does not throw at the safe integer limits', () => {
    expect(formatRupees(money(MIN))).toBe('-₹9,00,71,99,25,47,409.91');
  });
});
