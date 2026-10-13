import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import { subsWithItems, type Category } from './catalogueTree';
import { categoriesMatching, categoryIndex, resolveCategories } from './categoryLists';
import { tintColor } from './categoryGroups';
import { categoryPicture } from './categoryPictures';
import { useHomeItems } from './items';
import { categoryTile, type CategoryTileData } from './useCategoryTiles';

/**
 * One tile of a category's row. The first is the category itself, with its picture (the way into all of it); the others are its
 * kinds, each opening the category's screen on that kind.
 */
export interface BrowseTile extends CategoryGridTile {
  /** The kind's id, for the `sub` of the category's address. Undefined for the category's own tile. */
  subId?: string;
}

/** A live category as the Categories tab draws it: its own tile first, then the kinds that have something in stock. */
export interface BrowseCategory {
  id: string;
  tiles: readonly BrowseTile[];
}

export interface BrowseGroup {
  id: string;
  /** Already translated. */
  title: string;
  categories: readonly BrowseCategory[];
}

/**
 * The Categories tab's content: the live categories in their groups, each a row of tiles (the category's own, then the kinds that
 * have something in stock), then the categories that are coming as the tiles of "Coming to Roha". `query` narrows by a category's name or one of its kinds (a
 * group with none left is dropped). `total` is how many categories the town lists, before the query, so the screen can tell "no
 * categories" from "none match".
 */
export function useCategoryBrowse(query = ''): {
  groups: readonly BrowseGroup[];
  coming: { title: string; tiles: readonly CategoryTileData[] } | undefined;
  total: number;
} {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();
  const { groups, coming } = categoryIndex(resolveCategories(items));
  const nameOf = (entry: Category) => t(entry.label);
  const subNameOf = (sub: { label: Parameters<typeof t>[0] }) => t(sub.label);
  const narrow = (categories: readonly Category[]) =>
    categoriesMatching(categories, query, nameOf, subNameOf);

  const browse: BrowseGroup[] = groups
    .map((entry) => ({
      id: entry.group.id,
      title: t(entry.group.label),
      categories: narrow(entry.categories).map((category): BrowseCategory => {
        const picture = categoryPicture(category.id);
        const tint = tintColor(colors, category.tint);
        return {
          id: category.id,
          tiles: [
            {
              label: t(category.label),
              emoji: category.emoji,
              tint,
              ...(picture !== undefined ? { picture } : {}),
            },
            ...subsWithItems(items, category).map((sub) => ({
              subId: sub.id,
              label: t(sub.label),
              emoji: sub.emoji,
              tint,
            })),
          ],
        };
      }),
    }))
    .filter((group) => group.categories.length > 0);

  const comingTiles = narrow(coming).map((entry) => categoryTile(entry, t, colors));
  const total = groups.reduce((sum, entry) => sum + entry.categories.length, coming.length);

  return {
    groups: browse,
    coming:
      comingTiles.length > 0
        ? { title: t('categoriesTab.comingTitle'), tiles: comingTiles }
        : undefined,
    total,
  };
}
