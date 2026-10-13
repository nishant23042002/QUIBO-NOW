import type { ImageSourcePropType } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import { subsWithItems, type Category } from './catalogueTree';
import { categoriesMatching, categoryIndex, resolveCategories } from './categoryLists';
import { tintColor } from './categoryGroups';
import { departmentPicture } from './departmentPictures';
import { useHomeItems } from './items';
import { tileOf, type DepartmentTile } from './useDepartmentTiles';

/** One kind of a category, as a tile that opens the category's screen on that kind. */
export interface KindTile extends CategoryGridTile {
  /** The kind's id, for the `sub` of the category's address. */
  subId: string;
}

/** A live category as the Categories tab draws it: a title row with its picture, then its kinds as tiles. */
export interface BrowseCategory {
  id: string;
  /** Already translated. */
  label: string;
  /** The emoji stands in until the category has its picture. */
  emoji: string;
  tint: string;
  picture?: ImageSourcePropType;
  kinds: readonly KindTile[];
}

export interface BrowseGroup {
  id: string;
  /** Already translated. */
  title: string;
  categories: readonly BrowseCategory[];
}

/**
 * The Categories tab's content: the live categories in their groups, each with the kinds that have something in stock as tiles, then
 * the categories that are coming as the tiles of "Coming to Roha". `query` narrows by a category's name or one of its kinds (a
 * group with none left is dropped). `total` is how many categories the town lists, before the query, so the screen can tell "no
 * categories" from "none match".
 */
export function useCategoryBrowse(query = ''): {
  groups: readonly BrowseGroup[];
  coming: { title: string; tiles: readonly DepartmentTile[] } | undefined;
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
        const picture = departmentPicture(category.id);
        return {
          id: category.id,
          label: t(category.label),
          emoji: category.emoji,
          tint: tintColor(colors, category.tint),
          ...(picture !== undefined ? { picture } : {}),
          kinds: subsWithItems(items, category).map((sub) => ({
            subId: sub.id,
            label: t(sub.label),
            emoji: sub.emoji,
            tint: tintColor(colors, category.tint),
          })),
        };
      }),
    }))
    .filter((group) => group.categories.length > 0);

  const comingTiles = narrow(coming).map((entry) => tileOf(entry, t, colors));
  const total = groups.reduce((sum, entry) => sum + entry.categories.length, coming.length);

  return {
    groups: browse,
    coming:
      comingTiles.length > 0
        ? { title: t('departments.comingTitle'), tiles: comingTiles }
        : undefined,
    total,
  };
}
