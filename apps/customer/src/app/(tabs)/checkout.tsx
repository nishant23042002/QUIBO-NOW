import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { armQuietCartReturn } from '@/home/cartReturn';
import { useCart } from '@/home/CartProvider';
import { CheckoutView } from '@/home/CheckoutView';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** The last step before an order is placed, opened from the cart. It lives in the tab group so the bottom bar stays. */
export default function CheckoutScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const cart = useCart();

  return (
    <View style={styles.page}>
      <CartHeader
        title={t('checkout.title')}
        {...(cart.count > 0 ? { subtitle: cart.itemsLabel } : {})}
        backLabel={t('common.back')}
        onBack={() => {
          armQuietCartReturn();
          if (router.canGoBack()) router.back();
          else router.replace('/cart');
        }}
      />
      <CheckoutView />
    </View>
  );
}
