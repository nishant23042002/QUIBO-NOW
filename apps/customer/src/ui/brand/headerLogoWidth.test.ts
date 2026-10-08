import { describe, expect, it } from 'vitest';
import { headerLogoHeight, headerLogoWidth } from './headerLogoWidth';

/** The shortest header a phone draws: iOS, 44 dp. Android's is 56 dp. */
const SHORTEST_HEADER = 44;

describe('header logo size', () => {
  it('grows with the screen between a small phone and a tablet', () => {
    expect(headerLogoWidth(320)).toBe(96);
    expect(headerLogoWidth(360)).toBe(108);
    expect(headerLogoWidth(412)).toBe(120);
  });

  it('stops growing, so a tablet does not get a giant logo', () => {
    expect(headerLogoWidth(768)).toBe(120);
    expect(headerLogoWidth(1280)).toBe(120);
  });

  it('never gets too small to read, even on a very narrow screen', () => {
    expect(headerLogoWidth(200)).toBe(96);
    expect(headerLogoWidth(0)).toBe(96);
  });

  it('always fits inside the shortest header', () => {
    for (const screen of [0, 200, 320, 360, 412, 600, 768, 1024, 2000]) {
      expect(headerLogoHeight(headerLogoWidth(screen))).toBeLessThanOrEqual(SHORTEST_HEADER);
    }
  });

  it('keeps the logo in proportion', () => {
    expect(headerLogoHeight(482)).toBeCloseTo(176, 5);
  });
});
