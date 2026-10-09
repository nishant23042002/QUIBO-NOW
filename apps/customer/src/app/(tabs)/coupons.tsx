import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { armQuietCartReturn } from '@/home/cartReturn';
import { CouponsView } from '@/home/CouponsView';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({
  page: { flex: 1 },
});

/** The coupons page, opened from the cart. It lives in the tab group so the bottom bar stays. */
export default function CouponsScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View style={styles.page}>
      <CartHeader
        title={t('coupons.title')}
        backLabel={t('common.back')}
        onBack={() => {
          armQuietCartReturn();
          if (router.canGoBack()) router.back();
          else router.replace('/cart');
        }}
      />
      <CouponsView />
    </View>
  );
}
