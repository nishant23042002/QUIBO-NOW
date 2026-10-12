import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { CATEGORY_GROUPS, HOME_CATEGORY_TILES, tintColor, type TileTarget } from './categoryGroups';

export interface CategoryTile {
  label: string;
  emoji: string;
  /** The colour behind the picture. */
  tint: string;
  target: TileTarget;
}

export interface CategoryGroup {
  title: string;
  tiles: readonly CategoryTile[];
}

/** The Categories tab's groups, worded in the chosen language and coloured for the current theme. */
export function useCategoryGroups(): readonly CategoryGroup[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  return CATEGORY_GROUPS.map((group) => ({
    title: t(group.title),
    tiles: group.tiles.map((tile) => ({
      label: t(tile.label),
      emoji: tile.emoji,
      tint: tintColor(colors, tile.tint),
      target: tile.target,
    })),
  }));
}

/** Home's "Shop by category" tiles, worded and coloured the same way. */
export function useHomeCategoryTiles(): readonly CategoryTile[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  return HOME_CATEGORY_TILES.map((tile) => ({
    label: t(tile.label),
    emoji: tile.emoji,
    tint: tintColor(colors, tile.tint),
    target: tile.target,
  }));
}
