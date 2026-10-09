import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ComingSoon } from '@/ui';

// Built in a later section of Phase 1 (address, then checkout and tracking).
export default function CheckoutScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <ComingSoon
      title={t('cart.checkout')}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/cart');
      }}
    />
  );
}
