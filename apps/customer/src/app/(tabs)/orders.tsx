import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { OrdersView } from '@/orders/OrdersView';
import { AppHeader } from '@/ui';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** The shopper's orders. It is one of the four tabs, so it has no back button. */
export default function OrdersScreen() {
  const { t } = useLanguage();

  return (
    <View style={styles.page}>
      <AppHeader title={t('orders.title')} />
      <OrdersView />
    </View>
  );
}
