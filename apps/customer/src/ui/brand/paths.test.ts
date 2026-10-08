import { describe, expect, it } from 'vitest';
import { BARS_MARK, BARS_STACKED, NOW_STACKED, Q_MARK, SIZE, VIEW_BOX, WORDMARK } from './paths';

const contours = (d: string) => (d.match(/Z/g) ?? []).length;

describe('logo path data', () => {
  it('has four speed lines on the wordmark and on the mark, each a closed shape', () => {
    for (const bars of [BARS_STACKED, BARS_MARK]) {
      expect(bars).toHaveLength(4);
      for (const d of bars) expect(d).toMatch(/^M[\d.]+ [\d.]+.*Z$/);
    }
  });

  it('has the parent wordmark and Q, outlined, so no font is needed', () => {
    expect(WORDMARK).toMatch(/^M/);
    expect(contours(WORDMARK)).toBe(9); // Q 2, U 1, I 1, B 3, O 2
    expect(Q_MARK).toMatch(/^M/);
  });

  it('outlines NOW as four contours (N, the two of O, and W) inside one rounded tag', () => {
    expect(contours(NOW_STACKED.letters)).toBe(4);
    expect(contours(NOW_STACKED.pill)).toBe(1);
    expect(NOW_STACKED.letters).toMatch(/^[MLCQZ\d. -]+$/);
  });

  it('declares a view box that matches its stated size', () => {
    expect(VIEW_BOX.mark).toBe(`0 0 ${SIZE.mark.width} ${SIZE.mark.height}`);
    expect(VIEW_BOX.stacked.endsWith(`${SIZE.stacked.width} ${SIZE.stacked.height}`)).toBe(true);
  });
});
