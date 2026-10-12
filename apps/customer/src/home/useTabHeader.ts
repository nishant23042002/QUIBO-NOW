import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TabHeaderProps } from '@/ui';
import { useDeliveryAddress, useDeliveryWhen } from './deliveryInfo';
import { useSearchHint } from './searchHint';

/** Everything a tab that wears Home's header gives it, apart from its page and its rail, so each tab is one line away from it. */
export function useTabHeaderProps(): Omit<
  TabHeaderProps,
  'children' | 'rail' | 'bottomSpace' | 'onScrollY'
> {
  const { t } = useLanguage();
  const router = useRouter();
  const when = useDeliveryWhen();
  const address = useDeliveryAddress();
  const searchHint = useSearchHint();

  return {
    deliveryLine: when.headline,
    address,
    addressCaption: t('home.header.addressCaption'),
    profileLabel: t('home.header.profile'),
    searchLabel: t('home.search.label'),
    searchHint,
    onSearchPress: () => {
      router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
    },
    onAddressPress: () => {
      router.push('/address');
    },
    onProfilePress: () => {
      router.push('/profile');
    },
  };
}
