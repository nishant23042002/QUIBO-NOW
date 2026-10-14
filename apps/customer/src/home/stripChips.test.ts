import { describe, expect, it } from 'vitest';
import { stripChips } from './stripChips';

describe('stripChips', () => {
  it('leads with Pay on delivery when cash on delivery is allowed', () => {
    expect(stripChips({ codMax: 100_000, store: 'partner' })).toEqual([
      'cod',
      'visited',
      'free',
      'upi',
    ]);
  });

  it('leaves Pay on delivery out when the town does not allow cash', () => {
    expect(stripChips({ codMax: 0, store: 'partner' })).toEqual(['visited', 'free', 'upi']);
  });

  it('leaves Visited shops only out when one dark store serves the town', () => {
    expect(stripChips({ codMax: 100_000, store: 'dark' })).toEqual(['cod', 'free', 'upi']);
  });
});
