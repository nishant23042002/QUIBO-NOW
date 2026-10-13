import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import type { CategoryTab } from '@/ui';
import { railCategories, resolveCategories } from './categoryLists';
import { useHomeItems } from './items';

/** The rail's first tab: the usual page. */
export const RAIL_ALL = 'all';
/** The rail's last tab, when there are more categories than fit: it opens the All categories screen. */
export const RAIL_MORE = 'more';

/** One tab of Home's header rail, with the colour the header takes (always its own lilac). */
export interface HomeRailTab extends CategoryTab {
  tint: string;
}

/**
 * The tabs of Home's header: All, then the live categories (at most six, in the order the town lists them), then More when there
 * are others. A category with nothing in stock is not on it. The header keeps its lilac whichever tab is chosen (ADR 0043).
 */
export function useHomeRail(): readonly HomeRailTab[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();
  const tint = colors.headerBg;
  const { shown, more } = railCategories(resolveCategories(items));

  return [
    { key: RAIL_ALL, label: t('home.categories.all'), emoji: '\u{1F6D2}', tint },
    ...shown.map((entry) => ({ key: entry.id, label: t(entry.rail), emoji: entry.emoji, tint })),
    ...(more ? [{ key: RAIL_MORE, label: t('categoriesTab.more'), emoji: '➕', tint }] : []),
  ];
}
