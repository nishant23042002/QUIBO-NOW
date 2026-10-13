import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type ThemeColors } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import type { Category } from './catalogueTree';
import {
  GRID_SIZE,
  categoriesMatching,
  categoryIndex,
  gridCategories,
  isLive,
  resolveCategories,
} from './categoryLists';
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
function tileOf(entry: Category, t: Translate, colors: ThemeColors): DepartmentTile {
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

export interface DepartmentSection {
  /** A stable key for the section. */
  id: string;
  /** Already translated. */
  title: string;
  tiles: readonly DepartmentTile[];
}

/**
 * The full list: the live categories in their groups, then those coming to Roha, each section a title and its tiles. `query`
 * narrows them by name (a section with none left is dropped). `total` is how many categories the town lists, before the query, so
 * the screen can tell "no categories" from "none match".
 */
export function useDepartmentIndex(query = ''): {
  sections: readonly DepartmentSection[];
  total: number;
} {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();
  const { groups, coming } = categoryIndex(resolveCategories(items));
  const nameOf = (entry: Category) => t(entry.label);
  const narrow = (categories: readonly Category[]) =>
    categoriesMatching(categories, query, nameOf).map((entry) => tileOf(entry, t, colors));

  const sections: DepartmentSection[] = [
    ...groups.map((entry) => ({
      id: entry.group.id,
      title: t(entry.group.label),
      tiles: narrow(entry.categories),
    })),
    { id: 'coming', title: t('departments.comingTitle'), tiles: narrow(coming) },
  ].filter((section) => section.tiles.length > 0);

  return {
    sections,
    total: groups.reduce((sum, entry) => sum + entry.categories.length, coming.length),
  };
}
