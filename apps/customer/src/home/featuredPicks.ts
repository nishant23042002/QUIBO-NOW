import type { MessageKey } from '@quibo/i18n';
import type { TileTarget, TileTint } from './categoryGroups';

/** One of this week's picks: what it is called, a line under it, a picture, its colour, and where it goes. */
export interface FeaturedSample {
  title: MessageKey;
  body: MessageKey;
  /** A stand-in for the picture, from emoji old enough for a low-end Android phone to draw. */
  emoji: string;
  tint: TileTint;
  target: TileTarget;
}

/**
 * This week's picks on Home, until the mock API supplies them (Phase 1b). A pick opens a category on Home, or search for a word, in the
 * same way a category tile does. The words are in the message files.
 */
export const FEATURED: readonly FeaturedSample[] = [
  {
    title: 'home.featured.rationTitle',
    body: 'home.featured.rationBody',
    emoji: '\u{1F33E}',
    tint: 'staples',
    target: { kind: 'category', category: 'staples' },
  },
  {
    title: 'home.featured.tiffinTitle',
    body: 'home.featured.tiffinBody',
    emoji: '\u{1F371}',
    tint: 'snacks',
    target: { kind: 'category', category: 'snacks' },
  },
  {
    title: 'home.featured.chaiTitle',
    body: 'home.featured.chaiBody',
    emoji: '\u2615',
    tint: 'neutral',
    target: { kind: 'search', term: 'tea' },
  },
];
