import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import type { CategoryTab } from '@/ui';
import { railDepartments, resolveDepartments } from './departments';
import { useHomeItems } from './items';

/** The rail's first tab: the usual page. */
export const RAIL_ALL = 'all';
/** The rail's last tab, when there are more departments than fit: it opens the All departments screen. */
export const RAIL_MORE = 'more';

/** One tab of Home's header rail, with the colour the header takes (always its own lilac). */
export interface HomeRailTab extends CategoryTab {
  tint: string;
}

/**
 * The tabs of Home's header: All, then the live departments (at most six, in the order the town lists them), then More when there
 * are others. A department with nothing in stock is not on it. The header keeps its lilac whichever tab is chosen (ADR 0043).
 */
export function useHomeRail(): readonly HomeRailTab[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();
  const tint = colors.headerBg;
  const { shown, more } = railDepartments(resolveDepartments(items));

  return [
    { key: RAIL_ALL, label: t('home.categories.all'), emoji: '\u{1F6D2}', tint },
    ...shown.map((entry) => ({ key: entry.id, label: t(entry.rail), emoji: entry.emoji, tint })),
    ...(more ? [{ key: RAIL_MORE, label: t('departments.more'), emoji: '➕', tint }] : []),
  ];
}
