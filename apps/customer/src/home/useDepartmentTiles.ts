import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type ThemeColors } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import type { Category } from './catalogueTree';
import { GRID_SIZE, gridCategories, isLive, resolveCategories } from './categoryLists';
import { tintColor } from './categoryGroups';
import { departmentPicture } from './departmentPictures';
import { useHomeItems } from './items';

/** One tile of "Shop by department": the grid's tile, and the category it stands for. */
export interface DepartmentTile extends CategoryGridTile {
  category: Category;
}

type Translate = ReturnType<typeof useLanguage>['t'];

/**
 * A category as a tile: worded in the chosen language and coloured for the current theme. One that is coming is softened and says
 * so; one that arrives tomorrow says that. Today is the usual and is not repeated on every tile.
 */
export function tileOf(entry: Category, t: Translate, colors: ThemeColors): DepartmentTile {
  const picture = departmentPicture(entry.id);
  return {
    category: entry,
    label: t(entry.label),
    emoji: entry.emoji,
    tint: tintColor(colors, entry.tint),
    ...(picture !== undefined ? { picture } : {}),
    ...(entry.tag === 'today' ? {} : { tag: t(`departments.tags.${entry.tag}`) }),
    ...(isLive(entry) ? {} : { soon: true }),
  };
}

/** The tiles of Home's "Shop by department": the live categories first, then the ones that are coming, up to eight. */
export function useDepartmentTiles(): readonly DepartmentTile[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();

  return gridCategories(resolveCategories(items), GRID_SIZE).map((entry) =>
    tileOf(entry, t, colors),
  );
}
