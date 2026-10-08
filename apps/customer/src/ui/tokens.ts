/*
 * Size tokens as plain TypeScript. Colours are not here: they come from the theme
 * (src/theme/palette.ts), so a component can never use a colour that has no dark version.
 */

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
