import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { useCart } from '@/home/CartProvider';
import { CartView } from '@/home/CartView';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({
  page: { flex: 1 },
});

/** The cart page, reached from the cart bar. It lives in the tab group so the bottom bar stays. */
export default function CartScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const cart = useCart();

  return (
    <View style={styles.page}>
      <CartHeader
        title={t('cart.title')}
        {...(cart.count > 0 ? { subtitle: cart.itemsLabel } : {})}
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
