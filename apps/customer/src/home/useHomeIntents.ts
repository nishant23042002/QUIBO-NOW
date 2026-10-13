import { useLanguage } from '@/i18n/LanguageProvider';
import { formatRupees, money } from '@quibo/contracts';
import type { IconName } from '@/ui';
import { UNDER_LIMIT, type IntentId } from './homeIntents';

/** One chip of the row under Home's banner. */
export interface HomeIntent {
  key: IntentId;
  /** Already translated. */
  label: string;
  /** A small picture of what the filter does, so the row reads as filters at a glance. */
  icon: IconName;
}

/**
 * The chips under Home's banner, in order: All, Quick, Offers, Under ₹50 and Veg. They are ways to look at what is on sale, not
 * categories (the header rail is for those): they narrow the page that is showing.
 */
export function useHomeIntents(): readonly HomeIntent[] {
  const { t } = useLanguage();

  return [
    { key: 'all', label: t('home.categories.all'), icon: 'grid' },
    { key: 'quick', label: t('home.intents.quick'), icon: 'clock' },
    { key: 'offers', label: t('home.intents.offers'), icon: 'tag' },
    {
      key: 'under',
      label: t('catalogue.filters.under', { amount: formatRupees(money(UNDER_LIMIT)) }),
      icon: 'rupee',
    },
    { key: 'veg', label: t('home.intents.veg'), icon: 'leaf' },
  ];
}
