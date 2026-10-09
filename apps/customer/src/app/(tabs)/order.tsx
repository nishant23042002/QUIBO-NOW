import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { useLanguage } from '@/i18n/LanguageProvider';
import { orderNumber } from '@/orders/ids';
import { useOrders } from '@/orders/OrdersProvider';
import { TrackingView } from '@/orders/TrackingView';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** One order's tracking page, opened from the Orders tab and right after an order is placed. It lives in the tab group so the bottom bar stays. */
export default function OrderScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { find } = useOrders();
  const tracked = id === undefined ? undefined : find(id);

  return (
    <View style={styles.page}>
      <CartHeader
        title={
          tracked === undefined
            ? t('orders.title')
            : t('orders.card', { number: orderNumber(tracked.order.id) })
        }
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/orders');
        }}
      />
      <TrackingView id={id ?? ''} />
    </View>
  );
}
