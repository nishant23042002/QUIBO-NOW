import { describe, expect, it } from 'vitest';
import { stripChips } from './stripChips';

describe('stripChips', () => {
  it('leads with Pay on delivery, then the best offers', () => {
    expect(stripChips({ codMax: 100_000, hasCoupon: true, hasSaving: true })).toEqual([
      'cod',
      'free',
      'code',
      'quiet',
    ]);
  });

  it('leaves Pay on delivery out when the town does not allow cash', () => {
    expect(stripChips({ codMax: 0, hasCoupon: true, hasSaving: true })).toEqual([
      'free',
      'code',
      'quiet',
    ]);
  });

  it('leaves an offer out when there is none to show', () => {
    expect(stripChips({ codMax: 100_000, hasCoupon: false, hasSaving: true })).toEqual([
      'cod',
      'free',
      'quiet',
    ]);
    expect(stripChips({ codMax: 100_000, hasCoupon: true, hasSaving: false })).toEqual([
      'cod',
      'free',
      'code',
    ]);
  });

  it('is never more than four chips', () => {
    expect(stripChips({ codMax: 1, hasCoupon: true, hasSaving: true }).length).toBeLessThanOrEqual(
      4,
    );
  });
});
