import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOrders } from '@/orders/OrdersProvider';
import { OrdersView } from '@/orders/OrdersView';
import { splitOrders } from '@/orders/split';
import { AppHeader } from '@/ui';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** The shopper's orders. It is one of the four tabs, so it has no back button. */
export default function OrdersScreen() {
  const { t } = useLanguage();
  const { orders } = useOrders();
  const active = splitOrders(orders).active.length;

  return (
    <View style={styles.page}>
      <AppHeader
        title={t('orders.title')}
        {...(active > 0 ? { subtitle: t('orders.activeCount', { count: active }) } : {})}
      />
      <OrdersView />
    </View>
  );
}
