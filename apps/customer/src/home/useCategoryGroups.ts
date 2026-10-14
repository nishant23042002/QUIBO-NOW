import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type ThemeColors } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import type { Category, CategoryGroupId } from './catalogueTree';
import { groupedCategories, isLive, resolveCategories } from './categoryLists';
import { tintColor } from './categoryGroups';
import { categoryPicture } from './categoryPictures';
import { useHomeItems } from './items';
import { groupNotifyId } from './notify';
import { useNotify } from './useNotify';

/** One tile of a group's grid: the grid's tile, and the category it stands for. */
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

/**
 * A category that is coming, as a tile the shopper can ask to be told about. It says "Soon" until they do, and then turns pistachio
 * and says it will tell them. The tile's name for a screen reader says what a tap does.
 */
export function soonTile(
  entry: Category,
  t: Translate,
  colors: ThemeColors,
  notified: boolean,
): CategoryTileData {
  const base = categoryTile(entry, t, colors);
  return {
    ...base,
    tag: notified ? t('catalogue.notify.tag') : t('catalogue.tags.soon'),
    soon: true,
    notified,
    hint: notified ? t('catalogue.notify.hintOn') : t('catalogue.notify.hint'),
  };
}

/** One group as Home and the Categories tab draw it. */
export interface GroupView {
  id: CategoryGroupId;
  /** Already translated. */
  title: string;
  /** The categories the town stocks. A group with none is one that is only coming. */
  live: readonly Category[];
  /** Live ones first, then those coming with Notify me. */
  tiles: readonly CategoryTileData[];
  /** Up to three pictures that stand for the group, for its card on "Coming soon to Roha". */
  emojis: readonly string[];
  /** The id Notify me uses for the whole group, and whether it is on. */
  notifyId: string;
  notified: boolean;
}

/** Every group that holds anything, in order, with its tiles, drawn from the stocked and coming categories. */
export function useCategoryGroups(): readonly GroupView[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();
  const notify = useNotify();

  return groupedCategories(resolveCategories(items)).map((entry) => {
    const notifyId = groupNotifyId(entry.group.id);
    return {
      id: entry.group.id,
      title: t(entry.group.label),
      live: entry.live,
      tiles: [
        ...entry.live.map((category) => categoryTile(category, t, colors)),
        ...entry.soon.map((category) => soonTile(category, t, colors, notify.has(category.id))),
      ],
      emojis: [...entry.live, ...entry.soon].slice(0, 3).map((category) => category.emoji),
      notifyId,
      notified: notify.has(notifyId),
    };
  });
}
