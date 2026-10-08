import { describe, expect, it } from 'vitest';
import { TAP_MIN, colors, fontSize, leading, space, type ColorName } from './tokens';

/** Relative luminance of a #rrggbb colour, as WCAG 2.x defines it. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two #rrggbb colours: 1 (identical) to 21 (black on white). */
function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

type Pair = readonly [foreground: ColorName, background: ColorName];

/** Every text colour on every background the primitives and screens put it on. WCAG AA: 4.5:1. */
const TEXT: readonly Pair[] = [
  ['ink', 'canvas'],
  ['ink', 'surface'],
  ['ink', 'surfaceMuted'],
  ['ink', 'dangerSubtle'],
  ['inkMuted', 'canvas'],
  ['inkMuted', 'surface'],
  ['inkMuted', 'surfaceMuted'],
  ['onBrand', 'brand'],
  ['onBrand', 'brandPressed'],
  ['brand', 'canvas'],
  ['brand', 'surface'],
  ['brand', 'brandSubtle'],
  ['danger', 'canvas'],
  ['danger', 'surface'],
  ['danger', 'dangerSubtle'],
  ['success', 'successSubtle'],
  ['warning', 'warningSubtle'],
  ['info', 'infoSubtle'],
];

/** Borders and focus colours that mark where a control is. WCAG AA: 3:1. */
const CONTROL_EDGES: readonly Pair[] = [
  ['lineStrong', 'canvas'],
  ['lineStrong', 'surface'],
  ['danger', 'canvas'],
  ['danger', 'surface'],
  ['focus', 'canvas'],
  ['focus', 'surface'],
  ['brand', 'canvas'],
];

const ratio = ([foreground, background]: Pair) => contrast(colors[foreground], colors[background]);
const label = ([foreground, background]: Pair) => `${foreground} on ${background}`;

describe('colour contrast (WCAG AA)', () => {
  it.each(TEXT.map((pair) => [label(pair), pair] as const))(
    'text: %s is at least 4.5:1',
    (_name, pair) => {
      expect(ratio(pair)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(CONTROL_EDGES.map((pair) => [label(pair), pair] as const))(
    'control edge: %s is at least 3:1',
    (_name, pair) => {
      expect(ratio(pair)).toBeGreaterThanOrEqual(3);
    },
  );

  it('keeps disabled text legible, even though WCAG exempts it (3:1)', () => {
    expect(contrast(colors.disabledText, colors.disabledBg)).toBeGreaterThanOrEqual(3);
  });
});

describe('the contrast check itself', () => {
  it('measures the known extremes', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('does not depend on which colour is passed first', () => {
    expect(contrast('#1b6b3a', '#ffffff')).toBeCloseTo(contrast('#ffffff', '#1b6b3a'), 10);
  });

  it('reports the well-known near miss: #777777 on white is 4.48:1, below 4.5', () => {
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(contrast('#777777', '#ffffff')).toBeLessThan(4.5);
  });
});

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

  it('spaces things on a 4 dp grid', () => {
    for (const value of Object.values(space)) expect(value % 4).toBe(0);
  });
});
