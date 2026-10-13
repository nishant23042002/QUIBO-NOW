import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type ThemeColors } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import type { Category } from './catalogueTree';
import { GRID_SIZE, gridCategories, isLive, resolveCategories } from './categoryLists';
import { tintColor } from './categoryGroups';
import { categoryPicture } from './categoryPictures';
import { useHomeItems } from './items';

/** One tile of "Shop by category": the grid's tile, and the category it stands for. */
export interface CategoryTileData extends CategoryGridTile {
  category: Category;
}

type Translate = ReturnType<typeof useLanguage>['t'];

/**
 * A category as a tile: worded in the chosen language and coloured for the current theme. One that is coming is softened and says
 * so; one that arrives tomorrow says that. Today is the usual and is not repeated on every tile.
 */
export function categoryTile(entry: Category, t: Translate, colors: ThemeColors): CategoryTileData {
  const picture = categoryPicture(entry.id);
  return {
    category: entry,
    label: t(entry.label),
    emoji: entry.emoji,
    tint: tintColor(colors, entry.tint),
    ...(picture !== undefined ? { picture } : {}),
    ...(entry.tag === 'today' ? {} : { tag: t(`catalogue.tags.${entry.tag}`) }),
    ...(isLive(entry) ? {} : { soon: true }),
  };
}

/** The tiles of Home's "Shop by category": the live categories first, then the ones that are coming, up to eight. */
export function useCategoryTiles(): readonly CategoryTileData[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();

  return gridCategories(resolveCategories(items), GRID_SIZE).map((entry) =>
    categoryTile(entry, t, colors),
  );
}
