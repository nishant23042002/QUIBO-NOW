import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { armQuietCartReturn } from '@/home/cartReturn';
import { useCart } from '@/home/CartProvider';
import { ScheduleView } from '@/home/ScheduleView';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({
  page: { flex: 1 },
});

/** The page where the shopper chooses when the order arrives, opened from the cart. */
export default function ScheduleScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const cart = useCart();

  return (
    <View style={styles.page}>
      <CartHeader
        title={t('cart.scheduleTitle')}
        {...(cart.count > 0 ? { subtitle: cart.itemsLabel } : {})}
        backLabel={t('common.back')}
        onBack={() => {
          armQuietCartReturn();
          if (router.canGoBack()) router.back();
          else router.replace('/cart');
        }}
      />
      <ScheduleView />
    </View>
  );
}
