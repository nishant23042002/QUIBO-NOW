import { formatRupees, money } from '@quibo/contracts';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { PromoSlide } from '@/ui';

/**
 * Sample offers for the home header until the mock API and the admin Content module supply them (Phase 1b
 * and Phase 3). The emoji are all old enough for a low-end Android phone to draw.
 */
export function useHomeOffers(): readonly PromoSlide[] {
  const { t } = useLanguage();

  return [
    {
      id: 'diwali',
      title: t('home.offers.diwaliTitle'),
      body: t('home.offers.diwaliBody'),
      emoji: '\u{1F386}',
      tone: 'brand',
    },
    {
      id: 'delivery',
      title: t('home.offers.deliveryTitle', { amount: formatRupees(money(29_900)) }),
      body: t('home.offers.deliveryBody'),
      emoji: '\u{1F6F5}',
      tone: 'pistachio',
    },
    {
      id: 'milk',
      title: t('home.offers.milkTitle'),
      body: t('home.offers.milkBody'),
      emoji: '\u{1F95B}',
      tone: 'mango',
    },
    {
      id: 'shops',
      title: t('home.offers.shopsTitle'),
      body: t('home.offers.shopsBody'),
      emoji: '\u{1F3EA}',
      tone: 'light',
    },
  ];
}
