import type { ImageSourcePropType } from 'react-native';
import attaRice from '../../assets/categories/attaRice.webp';
import biscuits from '../../assets/categories/biscuits.webp';
import chips from '../../assets/categories/chips.webp';
import dairyEggs from '../../assets/categories/dairyEggs.webp';
import oilMasala from '../../assets/categories/oilMasala.webp';
import sweets from '../../assets/categories/sweets.webp';
import vegFruit from '../../assets/categories/vegFruit.webp';

/**
 * The picture of each category that has one, by the category's id (ADR 0044). Each is a square WebP of a bundle of the shelf's
 * produce or packs on a flat `#F7F7F7` backdrop (the theme's `artworkPlate`), 512 px for a tile that shows at about 90 dp on a 3x phone. A category that
 * is not here (the pictures that have not been made yet) is drawn as its emoji on its colour, so a grid never has a gap.
 *
 * To add one: put `<id>.webp` in `assets/categories/`, import it above and list it here.
 */
export const CATEGORY_PICTURES: Readonly<Record<string, ImageSourcePropType | undefined>> = {
  vegFruit,
  dairyEggs,
  attaRice,
  oilMasala,
  chips,
  biscuits,
  sweets,
};

/** The picture of a category or main category, or undefined when it has none yet. */
export function categoryPicture(id: string): ImageSourcePropType | undefined {
  return CATEGORY_PICTURES[id];
}
