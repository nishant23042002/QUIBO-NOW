/**
 * Which picture the free-delivery note shows. This is the one place to switch it back: set `DELIVERY_ART` to 'classic' and
 * the full-colour scooter (`assets/delivery-scooter.png`) is back, nothing else changes.
 *
 * - classic: the full-colour scooter, which fills with colour from its left as free delivery nears.
 * - mono: a white front-view scooter on a clear background, which fills with white the same way and takes a colour from
 *   the theme, pistachio once free delivery is reached.
 */
export type DeliveryArt = 'classic' | 'mono';

export const DELIVERY_ART: DeliveryArt = 'mono';

/** A theme colour name the picture is painted in, or null to leave the picture as drawn. */
export type ArtTint = 'onChrome' | 'accent';

export function artTint(art: DeliveryArt, free: boolean): ArtTint | null {
  if (art === 'classic') return null;
  return free ? 'accent' : 'onChrome';
}
