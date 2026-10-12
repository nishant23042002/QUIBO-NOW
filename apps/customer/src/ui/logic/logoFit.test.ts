import { describe, expect, it } from 'vitest';
import { fitLogo } from './logoFit';

const BOX = { width: 68, height: 52 };

describe('fitLogo', () => {
  it('never draws larger than the room', () => {
    for (const aspect of [0.5, 0.78, 1, 1.4, 2.9, 5]) {
      const size = fitLogo(aspect, BOX);
      expect(size.width).toBeLessThanOrEqual(BOX.width);
      expect(size.height).toBeLessThanOrEqual(BOX.height);
    }
  });

  it("keeps the picture's shape", () => {
    for (const aspect of [0.78, 1, 1.79, 2.9]) {
      const size = fitLogo(aspect, BOX);
      expect(size.width / size.height).toBeCloseTo(aspect, 0);
    }
  });

  it('gives a wide wordmark the full width and a tall one the full height', () => {
    expect(fitLogo(4, BOX).width).toBe(BOX.width);
    expect(fitLogo(0.4, BOX).height).toBe(BOX.height);
  });

  it('gives a round badge about the same area as a wide wordmark that is not clipped by the width', () => {
    const round = fitLogo(1, BOX);
    const wideish = fitLogo(1.5, BOX);
    const area = (size: { width: number; height: number }) => size.width * size.height;
    expect(Math.abs(area(round) - area(wideish)) / area(round)).toBeLessThan(0.1);
  });

  it('draws nothing for a picture with no shape', () => {
    expect(fitLogo(0, BOX)).toEqual({ width: 0, height: 0 });
    expect(fitLogo(Number.NaN, BOX)).toEqual({ width: 0, height: 0 });
  });
});
