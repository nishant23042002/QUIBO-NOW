import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';

/**
 * The one custom font the app carries: Bricolage Grotesque, for display text only (the estimate, titles, headings). Body text,
 * labels and prices stay in the phone's own font, which keeps Hindi and Marathi (Bricolage has no Devanagari) and small text sharp.
 * One weight is loaded, Bold: Bricolage reads lighter than a phone's own bold at the same size, so its SemiBold made section
 * headings look thin beside the labels under them. A custom font is chosen by family name and not by `fontWeight`.
 */
export const DISPLAY_FONT_FILES = {
  BricolageGrotesque_700Bold,
};

export const DISPLAY_FAMILY = {
  bold: 'BricolageGrotesque_700Bold',
} as const;
