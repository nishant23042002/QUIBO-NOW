import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { Locale } from '@quibo/i18n';
import type { TabHeaderProps } from '@/ui';
import { useDeliveryAddress, useDeliveryWhen } from './deliveryInfo';
import { useSearchHint } from './searchHint';

/** The language in use, short, as the header's chip shows it: each in its own script. */
const LANGUAGE_CODE: Readonly<Record<Locale, string>> = { en: 'EN', hi: 'हिं', mr: 'मरा' };

/** Everything a tab that wears Home's header gives it, apart from its page and its rail, so each tab is one line away from it. */
export function useTabHeaderProps(): Omit<
  TabHeaderProps,
  'children' | 'rail' | 'bottomSpace' | 'onScrollY'
> {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const when = useDeliveryWhen();
  const address = useDeliveryAddress();
  const searchHint = useSearchHint();

  return {
    deliveryLabel: when.label,
    deliveryValue: when.short,
    address,
    addressCaption: t('home.header.addressCaption'),
    profileLabel: t('home.header.profile'),
    languageCode: LANGUAGE_CODE[locale],
    languageLabel: t('home.header.language'),
    // The language is set in Profile until the language sheet is built (ADR 0055, step 9).
    onLanguagePress: () => {
      router.push('/profile');
    },
    searchLabel: t('home.search.label'),
    searchHint,
    onSearchPress: () => {
      router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
    },
    scheduleLabel: t('home.header.scheduleSlot'),
    onSchedulePress: () => {
      router.push('/schedule');
    },
    onAddressPress: () => {
      router.push('/address');
    },
    onProfilePress: () => {
      router.push('/profile');
    },
  };
}
