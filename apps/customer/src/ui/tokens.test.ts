import { describe, expect, it } from 'vitest';
import { headerLogoHeight, headerLogoWidth } from './brand/headerLogoWidth';
import { HEADER_HEIGHT, TAP_MIN, fontSize, leading, space } from './tokens';

describe('sizes for this audience', () => {
  it('keeps every tap target and every text size usable', () => {
    expect(TAP_MIN).toBeGreaterThanOrEqual(48);
    for (const size of Object.values(fontSize)) expect(size).toBeGreaterThanOrEqual(14);
    expect(fontSize.base).toBeGreaterThanOrEqual(18);
  });

  it('gives Hindi and Marathi more line height than English at every step', () => {
    for (const step of ['tight', 'normal', 'relaxed'] as const) {
      expect(leading.devanagari[step]).toBeGreaterThan(leading.latin[step]);
    }
  });

  it('has a header tall enough for a thumb and for the biggest logo, with room to spare', () => {
    expect(HEADER_HEIGHT).toBeGreaterThanOrEqual(TAP_MIN);
    expect(HEADER_HEIGHT - headerLogoHeight(headerLogoWidth(2000))).toBeGreaterThanOrEqual(8);
  });

  it('spaces things on a 4 dp grid', () => {
    for (const value of Object.values(space)) expect(value % 4).toBe(0);
  });
});
