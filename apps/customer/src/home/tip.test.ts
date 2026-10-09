import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { isPreset, parseTip } from './tip';

const MAX = money(10_000);

describe('parseTip', () => {
  it('reads whole rupees as paise', () => {
    expect(parseTip('45', MAX)).toBe(4_500);
    expect(parseTip(' 10 ', MAX)).toBe(1_000);
    expect(parseTip('100', MAX)).toBe(10_000);
  });

  it('refuses anything that is not a whole number from 1 up to the limit', () => {
    for (const bad of ['', '  ', '0', '00', '101', '12.5', '-5', 'ten', '1e2', '₹20', '1 0']) {
      expect(parseTip(bad, MAX), bad).toBeUndefined();
    }
  });
});

describe('isPreset', () => {
  it('knows the ready-made amounts', () => {
    const options = [money(1_000), money(2_000), money(3_000)];
    expect(isPreset(money(2_000), options)).toBe(true);
    expect(isPreset(money(4_500), options)).toBe(false);
  });
});
