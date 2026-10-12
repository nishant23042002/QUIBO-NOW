import { StyleSheet, View } from 'react-native';
import { OrdersView } from '@/orders/OrdersView';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** The shopper's orders, under the header Home wears. It is one of the four tabs, so it has no back button. */
export default function OrdersScreen() {
  return (
    <View style={styles.page}>
      <OrdersView />
    </View>
  );
}
