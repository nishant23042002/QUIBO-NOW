import { describe, expect, it } from 'vitest';
import { entryShare, shownPrice } from './entryPrice';

describe('entryShare', () => {
  it('is half of a price per kilogram for the half kilogram ADD puts in', () => {
    expect(entryShare(4200, 0.5)).toBe(2100);
    expect(entryShare(3400, 0.5)).toBe(1700);
  });

  it('rounds to whole paise, never a fraction', () => {
    expect(entryShare(4201, 0.5)).toBe(2101);
    expect(Number.isInteger(entryShare(3333, 0.5))).toBe(true);
  });

  it('is the price itself for a whole unit', () => {
    expect(entryShare(4800, 1)).toBe(4800);
  });
});

describe('shownPrice', () => {
  it('prefers what ADD costs and falls back to the price', () => {
    expect(shownPrice({ price: 4200, entryPrice: 2100 })).toBe(2100);
    expect(shownPrice({ price: 4800 })).toBe(4800);
  });
});
