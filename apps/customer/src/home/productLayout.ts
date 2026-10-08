import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/theme';
import { radius, space } from '@/ui';

/** The height of the bar with the price and ADD, above the bottom navigation bar. */
export const ACTION_HEIGHT = 68;

/**
 * The frame of the product page, shared by the page and its loading skeleton so the two always line up: the gap
 * between blocks, the side gutter, and the card every block sits in (white on the soft page, one rounded edge, one line).
 */
export const makePageStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { gap: space[3], paddingTop: space[3] },
    gutter: { paddingHorizontal: space[3] },
    card: {
      gap: space[2],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    // A card with a title and then its own blocks, which sit a little further apart.
    section: { gap: space[3] },
  });
