import { describe, expect, it } from 'vitest';
import { baseAmount, bestValueIndex, capQuantity, defaultPackIndex, unitPrice } from './packs';

describe('baseAmount', () => {
  it('counts in millilitres, grams and pieces', () => {
    expect(baseAmount({ amount: 1, unit: 'l' })).toBe(1000);
    expect(baseAmount({ amount: 500, unit: 'ml' })).toBe(500);
    expect(baseAmount({ amount: 5, unit: 'kg' })).toBe(5000);
    expect(baseAmount({ amount: 400, unit: 'g' })).toBe(400);
    expect(baseAmount({ amount: 1, unit: 'dozen' })).toBe(12);
    expect(baseAmount({ amount: 6, unit: 'pcs' })).toBe(6);
  });
});

describe('unitPrice', () => {
  it('gives the price per litre for millilitres and litres', () => {
    expect(unitPrice(2900, { amount: 500, unit: 'ml' })).toEqual({ kind: 'l', paise: 5800 });
    expect(unitPrice(5600, { amount: 1, unit: 'l' })).toEqual({ kind: 'l', paise: 5600 });
  });

  it('gives the price per kilogram for grams and kilograms', () => {
    expect(unitPrice(3500, { amount: 400, unit: 'g' })).toEqual({ kind: 'kg', paise: 8750 });
    expect(unitPrice(24500, { amount: 5, unit: 'kg' })).toEqual({ kind: 'kg', paise: 4900 });
  });

  it('gives the price per piece, a dozen being twelve', () => {
    expect(unitPrice(4800, { amount: 6, unit: 'pcs' })).toEqual({ kind: 'pc', paise: 800 });
    expect(unitPrice(6000, { amount: 1, unit: 'dozen' })).toEqual({ kind: 'pc', paise: 500 });
  });

  it('rounds to whole paise and gives nothing for a pack without a size', () => {
    expect(unitPrice(1000, { amount: 3, unit: 'pcs' })).toEqual({ kind: 'pc', paise: 333 });
    expect(unitPrice(1000, { amount: 1, unit: 'pack' })).toBeUndefined();
  });
});

describe('bestValueIndex', () => {
  const ml = (amount: number) => ({ amount, unit: 'ml' as const });

  it('picks the pack with the lowest price per litre', () => {
    const packs = [
      { price: 2900, size: ml(500), available: true },
      { price: 5600, size: ml(1000), available: true },
    ];
    expect(bestValueIndex(packs)).toBe(1);
  });

  it('has no best value for a single pack, or when the packs cost the same per litre', () => {
    expect(bestValueIndex([{ price: 2900, size: ml(500), available: true }])).toBeUndefined();
    expect(
      bestValueIndex([
        { price: 3000, size: ml(500), available: true },
        { price: 6000, size: ml(1000), available: true },
      ]),
    ).toBeUndefined();
  });

  it('ignores a pack that is out of stock', () => {
    const packs = [
      { price: 2900, size: ml(500), available: true },
      { price: 5600, size: ml(1000), available: false },
    ];
    expect(bestValueIndex(packs)).toBeUndefined();
  });

  it('does not compare packs counted in different things', () => {
    const packs = [
      { price: 2900, size: ml(500), available: true },
      { price: 3000, size: { amount: 400, unit: 'g' as const }, available: true },
    ];
    expect(bestValueIndex(packs)).toBeUndefined();
  });
});

describe('defaultPackIndex', () => {
  it('is the first pack that can be bought', () => {
    expect(defaultPackIndex([{ available: false }, { available: true }])).toBe(1);
    expect(defaultPackIndex([{ available: true }, { available: true }])).toBe(0);
  });

  it('is the first pack when none can be bought', () => {
    expect(defaultPackIndex([{ available: false }, { available: false }])).toBe(0);
  });
});

describe('capQuantity', () => {
  it('lets a pack with no stock figure go up to the most one order may hold', () => {
    expect(capQuantity(5, undefined, 20)).toBe(5);
    expect(capQuantity(25, undefined, 20)).toBe(20);
  });

  it('never goes above the number in stock', () => {
    expect(capQuantity(6, 3, 20)).toBe(3);
    expect(capQuantity(2, 3, 20)).toBe(2);
    expect(capQuantity(3, 3, 20)).toBe(3);
  });

  it('is cut by whichever limit is lower, and never goes below zero', () => {
    expect(capQuantity(30, 50, 20)).toBe(20);
    expect(capQuantity(-1, 3, 20)).toBe(0);
    expect(capQuantity(1, 0, 20)).toBe(0);
  });
});
