import { describe, expect, it } from 'vitest';
import {
  MOMENT_FACTS,
  MOMENT_GAP_MS,
  momentAllowedOn,
  momentFact,
  shouldShowFact,
  type MomentCheck,
} from './momentRules';

const base: MomentCheck = { count: 1, now: 100_000, last: null, pathname: '/', quiet: false };

describe('shouldShowFact', () => {
  it('shows on the first screen opened, then on every third', () => {
    const shown = [1, 2, 3, 4, 5, 6, 7, 9].filter((count) => shouldShowFact({ ...base, count }));
    expect(shown).toEqual([1, 3, 6, 9]);
  });

  it('never follows another moment within 20 seconds', () => {
    const recent = base.now - MOMENT_GAP_MS;
    expect(shouldShowFact({ ...base, last: recent })).toBe(false);
    expect(shouldShowFact({ ...base, last: recent - 1 })).toBe(true);
  });

  it('is not shown in front of a task screen', () => {
    for (const pathname of ['/checkout', '/cart', '/order', '/orders', '/address', '/search']) {
      expect(shouldShowFact({ ...base, pathname })).toBe(false);
    }
    expect(shouldShowFact({ ...base, pathname: '/category/dairy' })).toBe(true);
    expect(shouldShowFact({ ...base, pathname: '/shop/one' })).toBe(true);
  });

  it('steps aside for reduced motion and screen readers', () => {
    expect(shouldShowFact({ ...base, quiet: true })).toBe(false);
  });
});

describe('momentAllowedOn', () => {
  it('matches a route and what is under it, not a route that only starts the same', () => {
    expect(momentAllowedOn('/order')).toBe(false);
    expect(momentAllowedOn('/order/123')).toBe(false);
    expect(momentAllowedOn('/orders')).toBe(false);
    expect(momentAllowedOn('/ordering')).toBe(true);
  });
});

describe('momentFact', () => {
  it('goes round the facts and wraps', () => {
    expect(momentFact(0).id).toBe(MOMENT_FACTS[0].id);
    expect(momentFact(MOMENT_FACTS.length).id).toBe(MOMENT_FACTS[0].id);
    expect(momentFact(-1).id).toBe(MOMENT_FACTS[MOMENT_FACTS.length - 1]?.id);
  });

  it('has each fact once', () => {
    expect(new Set(MOMENT_FACTS.map((fact) => fact.id)).size).toBe(MOMENT_FACTS.length);
  });
});
