import { money } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { initialOf } from './initial';
import { freeDeliveryProgress, savings } from './money';
import { COUNT_RULE, WEIGHT_RULE, formatQuantity, stepQuantity } from './quantity';
import { SPLASH_FADE_MS, splashMinimumMs, splashPhase } from './splash';

describe('stepQuantity', () => {
  it('adds an item from nothing at the minimum, 1 for a count and 0.5 kg for loose weight', () => {
    expect(stepQuantity(0, 1, COUNT_RULE)).toBe(1);
    expect(stepQuantity(0, 1, WEIGHT_RULE)).toBe(0.5);
  });

  it('steps counts by 1 and loose weight by 0.5 kg', () => {
    expect(stepQuantity(1, 1, COUNT_RULE)).toBe(2);
    expect(stepQuantity(3, -1, COUNT_RULE)).toBe(2);
    expect(stepQuantity(0.5, 1, WEIGHT_RULE)).toBe(1);
    expect(stepQuantity(2, -1, WEIGHT_RULE)).toBe(1.5);
  });

  it('removes the item when stepping down from the minimum', () => {
    expect(stepQuantity(1, -1, COUNT_RULE)).toBe(0);
    expect(stepQuantity(0.5, -1, WEIGHT_RULE)).toBe(0);
  });

  it('stops at the maximum and never goes below zero', () => {
    expect(stepQuantity(20, 1, COUNT_RULE)).toBe(20);
    expect(stepQuantity(10, 1, WEIGHT_RULE)).toBe(10);
    expect(stepQuantity(0, -1, COUNT_RULE)).toBe(0);
  });

  it('is not thrown off by float noise from earlier arithmetic', () => {
    const rule = { min: 0.1, step: 0.1, max: 1 };
    let value = 0;
    for (let i = 0; i < 3; i++) value = stepQuantity(value, 1, rule);
    expect(value).toBe(0.3); // 0.1 + 0.1 + 0.1 is 0.30000000000000004 in plain float maths
    expect(stepQuantity(0.1 + 0.2, 1, rule)).toBe(0.4);
  });
});

describe('formatQuantity', () => {
  it('uses Latin digits and drops trailing zeros', () => {
    expect(formatQuantity(1)).toBe('1');
    expect(formatQuantity(0.5)).toBe('0.5');
    expect(formatQuantity(2.25)).toBe('2.25');
    expect(formatQuantity(0.1 + 0.2)).toBe('0.3');
  });
});

describe('savings', () => {
  it('is the gap between the printed price and the price', () => {
    expect(savings(money(2900), money(3500))).toBe(600);
  });

  it('is null when the price is not lower', () => {
    expect(savings(money(3500), money(3500))).toBeNull();
    expect(savings(money(4000), money(3500))).toBeNull();
  });
});

describe('freeDeliveryProgress', () => {
  const threshold = money(49900);

  it('shows how much is left and how far along the bar is', () => {
    const progress = freeDeliveryProgress(money(31400), threshold);
    expect(progress.reached).toBe(false);
    expect(progress.remaining).toBe(18500);
    expect(progress.ratio).toBeCloseTo(0.629, 3);
  });

  it('is reached exactly at the threshold and beyond it', () => {
    for (const basket of [49900, 60000]) {
      const progress = freeDeliveryProgress(money(basket), threshold);
      expect(progress).toEqual({ ratio: 1, remaining: 0, reached: true });
    }
  });

  it('starts at zero for an empty basket', () => {
    expect(freeDeliveryProgress(money(0), threshold)).toMatchObject({
      ratio: 0,
      reached: false,
      remaining: 49900,
    });
  });

  it('treats a threshold of zero as always reached, so a town with no minimum shows no bar', () => {
    expect(freeDeliveryProgress(money(0), money(0)).reached).toBe(true);
  });
});

describe('initialOf', () => {
  it('takes the first letter in English, Hindi and Marathi', () => {
    expect(initialOf('Toned milk')).toBe('T');
    expect(initialOf('दूध')).toBe('द');
    expect(initialOf('टमाटर')).toBe('ट');
    expect(initialOf('दही')).toBe('द');
  });

  it('upper-cases Latin letters, ignores leading spaces, and gives an empty name a dot', () => {
    expect(initialOf('  eggs')).toBe('E');
    expect(initialOf('')).toBe('·');
    expect(initialOf('   ')).toBe('·');
  });
});

describe('splash timing', () => {
  it('holds until the app is ready and the minimum time is up, then leaves', () => {
    expect(splashPhase({ appReady: false, minimumElapsed: false })).toBe('holding');
    expect(splashPhase({ appReady: true, minimumElapsed: false })).toBe('holding');
    expect(splashPhase({ appReady: false, minimumElapsed: true })).toBe('holding');
    expect(splashPhase({ appReady: true, minimumElapsed: true })).toBe('leaving');
  });

  it('is shorter with reduce motion, and long enough to see the logo without it', () => {
    expect(splashMinimumMs(true)).toBeLessThan(splashMinimumMs(false));
    expect(splashMinimumMs(false)).toBeGreaterThanOrEqual(1000);
    expect(SPLASH_FADE_MS).toBeLessThanOrEqual(500);
  });
});
