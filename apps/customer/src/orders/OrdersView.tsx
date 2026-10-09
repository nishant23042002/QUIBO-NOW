import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from '@/home/loading';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  LoadGate,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  StatePanel,
  Text,
  radius,
  space,
  useScreenLoad,
} from '@/ui';
import { orderNumber } from './ids';
import { useOrders } from './OrdersProvider';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      gap: space[2],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    empty: { flex: 1, minHeight: 300 },
    skeleton: { flex: 1, overflow: 'hidden' },
  });

/** Grey blocks in the shape of one order card, so the list does not jump when the saved orders arrive. */
function OrdersSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.head}>
            <SkeletonLine size="base" width="40%" />
            <Skeleton width={64} height={24} rounded={radius.full} />
          </View>
          <SkeletonLine size="sm" width="65%" />
          <SkeletonLine size="sm" width="80%" />
        </View>
      </View>
    </SkeletonScope>
  );
}

function OrdersList() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, loaded } = useOrders();

  if (!loaded) return null;

  if (orders.length === 0) {
    return (
      <View style={styles.page}>
        <View style={styles.empty}>
          <StatePanel
            icon="receipt"
            title={t('orders.emptyTitle')}
            body={t('orders.emptyBody')}
            actionLabel={t('orders.emptyAction')}
            onAction={() => {
              router.navigate('/');
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {orders.map(({ order }) => (
        <Pressable
          key={order.id}
          role="link"
          onPress={() => {
            router.push({ pathname: '/order', params: { id: order.id } });
          }}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          aria-label={`${t('orders.card', { number: orderNumber(order.id) })}, ${t(`orders.status.${order.status}`)}`}
        >
          <View style={styles.head}>
            <Text variant="subheading" role="heading">
              {t('orders.card', { number: orderNumber(order.id) })}
            </Text>
            <Text variant="strong" color="accentInk">
              {formatRupees(order.total)}
            </Text>
          </View>
          <Text variant="strong">{t(`orders.status.${order.status}`)}</Text>
          <Text variant="small" color="inkMuted">
            {t('orders.items', { shops: order.shops.map((shop) => shop.name).join(', ') })}
          </Text>
          <Text variant="small" color="inkMuted">
            {order.payment.method === 'cod'
              ? t('orders.payCod', { amount: formatRupees(order.total) })
              : t('orders.payUpi', { amount: formatRupees(order.total) })}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/** The Orders tab: the orders kept on the phone, newest first. Tracking and past orders are built on this in the next pieces. */
export function OrdersView() {
  const { loaded } = useOrders();
  const load = useScreenLoad({ loadMs: SETTINGS_LOAD_MS, policy: SETTINGS_POLICY, hold: !loaded });
  return (
    <LoadGate load={load} skeleton={<OrdersSkeleton />}>
      <OrdersList />
    </LoadGate>
  );
}
