import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { settleWeight } from './weights';

const PER_KG = money(4_200);

describe('settleWeight', () => {
  it('bills exactly the estimate when the pack weighs what was asked for', () => {
    expect(settleWeight(1.5, 1.5, PER_KG, 5)).toEqual({ charge: 6_300, refund: 0, extra: 0 });
  });

  it('refunds the difference when the pack comes out lighter', () => {
    // 1.5 kg asked for, 1.38 kg packed: pays for 1.38 kg and gets 120 g back.
    expect(settleWeight(1.5, 1.38, PER_KG, 5)).toEqual({ charge: 5_796, refund: 504, extra: 0 });
  });

  it('charges a little more when it comes out heavier, within the tolerance', () => {
    // 1 kg asked for, 1.04 kg packed, 5% tolerance: pays for 1.04 kg.
    expect(settleWeight(1, 1.04, PER_KG, 5)).toEqual({ charge: 4_368, refund: 0, extra: 168 });
  });

  it('never bills past the ordered weight plus the tolerance, however much was packed', () => {
    // 1 kg asked for, 1.3 kg packed, 5% tolerance: billed as 1.05 kg.
    expect(settleWeight(1, 1.3, PER_KG, 5)).toEqual({ charge: 4_410, refund: 0, extra: 210 });
  });

  it('keeps every figure in whole paise', () => {
    const result = settleWeight(0.5, 0.437, money(5_600), 5);
    for (const value of Object.values(result)) expect(Number.isInteger(value)).toBe(true);
  });
});
