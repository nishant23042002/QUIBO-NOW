import { anyCardNote, type HomeItem } from './items';

/** About how many letters of a product name fit on one line of a rail card. */
const NAME_FITS = 12;

/**
 * What a skeleton needs to draw a row of cards as tall as the real row: whether the row keeps room for the extra line, and what
 * its tallest card holds (a name of two lines when one is long, and the extra line itself when an item has low stock or a time
 * to show). The real cards are never shorter than their reserved room and grow past it with their content, so the skeleton does
 * the same and the row lands at the height it will have.
 */
export function rowCardContent(row: readonly Pick<HomeItem, 'fullName' | 'stock' | 'quick'>[]): {
  reserveNote: boolean;
  content: { nameLines: 1 | 2; extraLine: boolean };
} {
  return {
    reserveNote: anyCardNote(row),
    content: {
      nameLines: row.some((item) => [...item.fullName].length > NAME_FITS) ? 2 : 1,
      extraLine: row.some(
        (item) => item.stock?.kind !== 'out' && (item.stock?.kind === 'low' || item.quick === true),
      ),
    },
  };
}
