/*
 * Design tokens as plain TypeScript. The colours are a placeholder palette: the brand is not
 * decided yet (PLAN section 1), so changing the look is a change to this file only. Every text
 * and control pairing was checked against WCAG AA (4.5:1 for text, 3:1 for borders).
 */

export const colors = {
  // Surfaces and text
  canvas: '#faf9f5',
  surface: '#ffffff',
  surfaceMuted: '#f0eee7',
  ink: '#1c1b18',
  inkMuted: '#57554d',
  // Decorative borders (cards, dividers). Not for controls such as inputs: use lineStrong.
  line: '#d9d6cc',
  // Borders of controls: 4:1 on white, above the 3:1 WCAG asks for.
  lineStrong: '#7d7a6f',
  scrim: 'rgba(28, 27, 24, 0.55)',

  // Brand and focus
  brand: '#1b6b3a',
  brandPressed: '#14552d',
  onBrand: '#ffffff',
  brandSubtle: '#e4f2e8',
  focus: '#1a5fb4',

  // Status. Each strong colour is text on its own subtle background.
  success: '#176534',
  successSubtle: '#e3f3e8',
  warning: '#7a4b00',
  warningSubtle: '#fff1d0',
  danger: '#b3261e',
  dangerSubtle: '#fde9e7',
  info: '#1a5fb4',
  infoSubtle: '#e5eefa',

  disabledBg: '#e6e4dc',
  disabledText: '#6b6960',
} as const;

export type ColorName = keyof typeof colors;

/** Spacing on a 4 dp grid. */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** The smallest thing a thumb has to hit, in dp. */
export const TAP_MIN = 48;

export const radius = { sm: 6, md: 12, lg: 16, xl: 24, full: 9999 } as const;

/**
 * Font sizes in dp. They grow with the phone's text-size setting, and nothing is below 14:
 * this audience includes elders and small, low-end screens.
 */
export const fontSize = {
  xs: 14,
  sm: 16,
  base: 18,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
} as const;

/**
 * Line height as a multiple of the font size. Devanagari stacks vowel signs above and below
 * the line, so Hindi and Marathi need more room than English.
 */
export const leading = {
  latin: { tight: 1.25, normal: 1.5, relaxed: 1.65 },
  devanagari: { tight: 1.45, normal: 1.7, relaxed: 1.85 },
} as const;
