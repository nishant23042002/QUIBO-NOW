import type { ImageSourcePropType } from 'react-native';
import attaRice from '../../assets/departments/attaRice.webp';
import biscuits from '../../assets/departments/biscuits.webp';
import chips from '../../assets/departments/chips.webp';
import dairyEggs from '../../assets/departments/dairyEggs.webp';
import oilMasala from '../../assets/departments/oilMasala.webp';
import sweets from '../../assets/departments/sweets.webp';
import vegFruit from '../../assets/departments/vegFruit.webp';

/**
 * The picture of each department that has one, by the department's id (ADR 0044). Each is a square WebP of a bundle of the shelf's
 * produce or packs on a flat `#F7F7F7` backdrop (the theme's `artworkPlate`), 512 px for a tile that shows at about 90 dp on a 3x phone. A department that
 * is not here (the pictures that have not been made yet) is drawn as its emoji on its colour, so a grid never has a gap.
 *
 * To add one: put `<id>.webp` in `assets/departments/`, import it above and list it here.
 */
export const DEPARTMENT_PICTURES: Readonly<Record<string, ImageSourcePropType | undefined>> = {
  vegFruit,
  dairyEggs,
  attaRice,
  oilMasala,
  chips,
  biscuits,
  sweets,
};

/** The picture of a department or main category, or undefined when it has none yet. */
export function departmentPicture(id: string): ImageSourcePropType | undefined {
  return DEPARTMENT_PICTURES[id];
}
