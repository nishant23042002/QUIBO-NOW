import { describe, expect, it } from 'vitest';
import { stripChips } from './stripChips';

describe('stripChips', () => {
  it('leads with Pay on delivery when cash on delivery is allowed', () => {
    expect(stripChips({ codMax: 100_000 })).toEqual(['cod', 'visited', 'free', 'upi']);
  });

  it('leaves Pay on delivery out when the town does not allow cash', () => {
    expect(stripChips({ codMax: 0 })).toEqual(['visited', 'free', 'upi']);
  });
});
