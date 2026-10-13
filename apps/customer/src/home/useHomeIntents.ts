import { useLanguage } from '@/i18n/LanguageProvider';
import { formatRupees, money } from '@quibo/contracts';
import { UNDER_LIMIT, type IntentId } from './homeIntents';

/** One chip of the row under Home's banner. */
export interface HomeIntent {
  key: IntentId;
  /** Already translated. */
  label: string;
}

/**
 * The chips under Home's banner, in order: All, Quick, Offers, Under ₹50 and Veg. They are ways to look at what is on sale, not
 * categories (the header rail is for those): they narrow the page that is showing.
 */
export function useHomeIntents(): readonly HomeIntent[] {
  const { t } = useLanguage();

  return [
    { key: 'all', label: t('home.categories.all') },
    { key: 'quick', label: t('home.intents.quick') },
    { key: 'offers', label: t('home.intents.offers') },
    {
      key: 'under',
      label: t('catalogue.filters.under', { amount: formatRupees(money(UNDER_LIMIT)) }),
    },
    { key: 'veg', label: t('home.intents.veg') },
  ];
}
