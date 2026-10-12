import { describe, expect, it } from 'vitest';
import { INTENT_IDS, UNDER_LIMIT, isIntent, matchesIntent, type IntentItem } from './homeIntents';

const item = (extra: Partial<IntentItem> = {}): IntentItem => ({
  price: 3000,
  diet: { kind: 'veg' },
  ...extra,
});

describe('matchesIntent', () => {
  it('shows everything for "All"', () => {
    for (const entry of [item(), item({ quick: true }), item({ diet: { kind: 'nonveg' } })]) {
      expect(matchesIntent(entry, 'all')).toBe(true);
    }
  });

  it('shows what can come in the next delivery for "Quick"', () => {
    expect(matchesIntent(item({ quick: true }), 'quick')).toBe(true);
    expect(matchesIntent(item(), 'quick')).toBe(false);
  });

  it('shows what costs less than it would for "Offers"', () => {
    expect(matchesIntent(item({ mrp: 3500 }), 'offers')).toBe(true);
    expect(matchesIntent(item({ mrp: 3000 }), 'offers')).toBe(false);
    expect(matchesIntent(item(), 'offers')).toBe(false);
  });

  it('shows what costs the limit or less for "Under"', () => {
    expect(matchesIntent(item({ price: UNDER_LIMIT }), 'under')).toBe(true);
    expect(matchesIntent(item({ price: UNDER_LIMIT + 1 }), 'under')).toBe(false);
  });

  it('shows what is vegetarian for "Veg"', () => {
    expect(matchesIntent(item(), 'veg')).toBe(true);
    expect(matchesIntent(item({ diet: { kind: 'nonveg' } }), 'veg')).toBe(false);
  });
});

describe('the chips', () => {
  it('starts with "All" and is made of ids that are recognised', () => {
    expect(INTENT_IDS[0]).toBe('all');
    for (const id of INTENT_IDS) expect(isIntent(id)).toBe(true);
    expect(isIntent('dairy')).toBe(false);
  });
});
