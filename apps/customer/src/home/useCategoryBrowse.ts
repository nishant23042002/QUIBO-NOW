import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import { subsWithItems, type Category } from './catalogueTree';
import { categoriesMatching, groupedCategories, resolveCategories } from './categoryLists';
import { tintColor } from './categoryGroups';
import { categoryPicture } from './categoryPictures';
import { useHomeItems } from './items';
import { soonTile, type CategoryTileData } from './useCategoryGroups';
import { useNotify } from './useNotify';

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
  /** The categories the town stocks, each a row of tiles. */
  categories: readonly BrowseCategory[];
  /** The categories of the group that are coming, as tiles with Notify me. */
  soon: readonly CategoryTileData[];
}

/**
 * The Categories tab's content (ADR 0046, ADR 0055): every group that holds anything. A group's stocked categories are each a row of
 * tiles (the category's own, then the kinds that have something in stock), and the categories of that group that are coming follow
 * as tiles with Notify me. A group that is only coming (beauty, tech, pharmacy, only on Quibo) is just those tiles. `query` narrows
 * by a category's name or one of its kinds (a group with nothing left is dropped). `total` is how many categories the town lists,
 * before the query, so the screen can tell "no categories" from "none match".
 */
export function useCategoryBrowse(query = ''): {
  groups: readonly BrowseGroup[];
  total: number;
} {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();
  const notify = useNotify();
  const entries = groupedCategories(resolveCategories(items));
  const nameOf = (entry: Category) => t(entry.label);
  const subNameOf = (sub: { label: Parameters<typeof t>[0] }) => t(sub.label);
  const narrow = (categories: readonly Category[]) =>
    categoriesMatching(categories, query, nameOf, subNameOf);

  const groups = entries
    .map((entry): BrowseGroup => {
      return {
        id: entry.group.id,
        title: t(entry.group.label),
        categories: narrow(entry.live).map((category): BrowseCategory => {
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
        soon: narrow(entry.soon).map((category) =>
          soonTile(category, t, colors, notify.has(category.id)),
        ),
      };
    })
    .filter((group) => group.categories.length > 0 || group.soon.length > 0);

  const total = entries.reduce((sum, entry) => sum + entry.live.length + entry.soon.length, 0);

  return { groups, total };
}
