import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ComingSoon } from '@/ui';

// Saved addresses and the map pin are built in a later section of Phase 1 (first run and address).
export default function AddressScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <ComingSoon
      title={t('trust.addressTitle')}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/cart');
      }}
    />
  );
}
