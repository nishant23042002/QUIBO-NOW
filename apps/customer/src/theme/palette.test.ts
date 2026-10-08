import { describe, expect, it } from 'vitest';
import { palettes, type Scheme, type ThemeColors } from './palette';

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

type Token = Exclude<keyof ThemeColors, 'scrim' | 'overlay'>;
type Pair = readonly [label: string, foreground: Token, background: Token, minimum: number];

/** Every pairing a screen relies on. 4.5:1 for text, 3:1 for the edge of a control or a shape. */
const REQUIRED: readonly Pair[] = [
  ['body text on the page', 'ink', 'bg', 4.5],
  ['body text on cards', 'ink', 'surface', 4.5],
  ['captions on the page', 'inkMuted', 'bg', 4.5],
  ['captions on cards', 'inkMuted', 'surface', 4.5],
  ['captions on tinted blocks', 'inkMuted', 'muted', 4.5],
  ['text on tinted blocks', 'ink', 'muted', 4.5],
  ['text on the header and cart bar', 'onChrome', 'chrome', 4.5],
  ['captions on the header and cart bar', 'onChromeMuted', 'chrome', 4.5],
  ['text on the home header', 'onHeader', 'headerBg', 4.5],
  ['captions on the home header', 'onHeaderMuted', 'headerBg', 4.5],
  ['icon on a home header button', 'onHeaderControl', 'headerControl', 4.5],
  ['text on the tintDairy', 'onHeader', 'tintDairy', 4.5],
  ['captions on the tintDairy', 'onHeaderMuted', 'tintDairy', 4.5],
  ['text on the tintVegetables', 'onHeader', 'tintVegetables', 4.5],
  ['captions on the tintVegetables', 'onHeaderMuted', 'tintVegetables', 4.5],
  ['text on the tintFruits', 'onHeader', 'tintFruits', 4.5],
  ['captions on the tintFruits', 'onHeaderMuted', 'tintFruits', 4.5],
  ['text on the tintStaples', 'onHeader', 'tintStaples', 4.5],
  ['captions on the tintStaples', 'onHeaderMuted', 'tintStaples', 4.5],
  ['text on the tintSnacks', 'onHeader', 'tintSnacks', 4.5],
  ['captions on the tintSnacks', 'onHeaderMuted', 'tintSnacks', 4.5],
  ['text on the shops chip', 'onHeaderControl', 'headerControl', 4.5],
  ['label on the main button', 'onAccent', 'accent', 4.5],
  ['label on a pressed main button', 'onAccent', 'accentPressed', 4.5],
  ['text on a selected chip or window', 'ink', 'accentSubtle', 4.5],
  ['accent text on cards', 'accentInk', 'surface', 4.5],
  ['accent text on the page', 'accentInk', 'bg', 4.5],
  ['offer tag text', 'tagFg', 'tagBg', 4.5],
  ['label on an outlined button fill', 'onAction', 'action', 4.5],
  ['control border on cards', 'ctl', 'surface', 3],
  ['control border on the page', 'ctl', 'bg', 3],
  ['outlined button on cards', 'action', 'surface', 3],
  ['accent shapes on the header and cart bar', 'accent', 'chrome', 3],
  ['accent text on the header and cart bar', 'accent', 'chrome', 4.5],
  ['success text', 'success', 'successBg', 4.5],
  ['success text on cards', 'success', 'surface', 4.5],
  ['warning text', 'warning', 'warningBg', 4.5],
  ['error text', 'danger', 'dangerBg', 4.5],
  ['info text', 'info', 'infoBg', 4.5],
];

const SCHEMES: readonly Scheme[] = ['light', 'dark'];

describe('theme contrast (WCAG AA)', () => {
  for (const scheme of SCHEMES) {
    it.each(REQUIRED.map((pair) => [pair[0], pair] as const))(
      `${scheme}: %s`,
      (_label, [, foreground, background, minimum]) => {
        const theme = palettes[scheme];
        expect(contrast(theme[foreground], theme[background])).toBeGreaterThanOrEqual(minimum);
      },
    );
  }

  it('keeps the logo tag readable on the page in the light theme (accent letters on an ink tag)', () => {
    expect(contrast(palettes.light.accent, palettes.light.action)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the accent off light surfaces as text, where it would be unreadable', () => {
    // The accent is a fill with a dark label. Anything that needs accent-coloured text uses accentInk.
    expect(contrast(palettes.light.accent, palettes.light.surface)).toBeLessThan(3);
    expect(contrast(palettes.light.accentInk, palettes.light.surface)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('the two themes', () => {
  it('define exactly the same colour roles', () => {
    expect(Object.keys(palettes.dark).sort()).toEqual(Object.keys(palettes.light).sort());
  });

  it('use only #rrggbb values, apart from the scrim', () => {
    for (const scheme of SCHEMES) {
      for (const [name, value] of Object.entries(palettes[scheme])) {
        if (name === 'scrim' || name === 'overlay') expect(value).toMatch(/^rgba\(/);
        else expect(value, `${scheme}.${name}`).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('keep text on the picture overlay readable even over the lightest picture', () => {
    for (const scheme of SCHEMES) {
      const { overlay, onOverlay, onOverlayMuted } = palettes[scheme];
      const alpha = Number(/rgba\(\d+, \d+, \d+, ([\d.]+)\)/.exec(overlay)?.[1]);
      // The overlay is black, so over white it comes out as this grey: the lightest it can look.
      const level = Math.round(255 * (1 - alpha));
      const lightest = `#${level.toString(16).padStart(2, '0').repeat(3).toUpperCase()}`;
      expect(contrast(onOverlay, lightest), `${scheme} text`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(onOverlayMuted, lightest), `${scheme} caption`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keep the header and cart bar dark in both, so the logo and main button never change', () => {
    for (const scheme of SCHEMES) expect(luminance(palettes[scheme].chrome)).toBeLessThan(0.05);
  });
});

describe('the contrast check itself', () => {
  it('measures the known extremes', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('reports the well-known near miss: #777777 on white is 4.48:1, below 4.5', () => {
    expect(contrast('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
    expect(contrast('#777777', '#FFFFFF')).toBeLessThan(4.5);
  });
});
