import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import type { CategoryTab } from '@/ui';
import { formatRupees, money } from '@quibo/contracts';
import { UNDER_LIMIT, type IntentId } from './homeIntents';

/** One chip of Home's header: the tab shape the header already draws, with the colour it takes (always the header's own). */
export interface HomeIntent extends CategoryTab {
  key: IntentId;
  tint: string;
}

/**
 * The chips on Home's header, with a picture each (a cart, a bolt, a price tag, a coin, a leaf). The header keeps its lilac whichever is
 * chosen: the chips are ways to look at what is on sale, not departments with colours of their own.
 */
export function useHomeIntents(): readonly HomeIntent[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const tint = colors.headerBg;

  return [
    { key: 'all', label: t('home.categories.all'), emoji: '\u{1F6D2}', tint },
    { key: 'quick', label: t('home.intents.quick'), emoji: '\u26A1', tint },
    { key: 'offers', label: t('home.intents.offers'), emoji: '\u{1F4B8}', tint },
    {
      key: 'under',
      label: t('catalogue.filters.under', { amount: formatRupees(money(UNDER_LIMIT)) }),
      emoji: '\u{1FA99}',
      tint,
    },
    { key: 'veg', label: t('home.intents.veg'), emoji: '\u{1F96C}', tint },
  ];
}
