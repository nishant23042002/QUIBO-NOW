import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartView } from '@/home/CartView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { AppHeader } from '@/ui';

const styles = StyleSheet.create({
  page: { flex: 1 },
});

/** The cart page, reached from the cart bar. It lives in the tab group so the bottom bar stays. */
export default function CartScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View style={styles.page}>
      <AppHeader
        title={t('cart.title')}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />
      <CartView />
    </View>
  );
}
