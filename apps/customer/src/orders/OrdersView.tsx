import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from '@/home/loading';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Icon,
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
import { ThumbRow } from './ItemThumb';
import type { TrackedOrder } from './machine';
import { useOrders } from './OrdersProvider';
import { lastEventAt, splitOrders } from './split';
import { endNoteOf, headlineOf } from './tracking';
import { useDateTimeLabel } from './useTime';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[4], paddingHorizontal: space[3], paddingTop: space[3] },
    section: { gap: space[3] },
    card: {
      gap: space[2],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    cardActive: { borderColor: c.action, borderWidth: 1.5 },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    track: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginTop: space[1] },
    quiet: {
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      borderStyle: 'dashed',
    },
    empty: { flex: 1, minHeight: 300 },
    skeleton: { flex: 1, overflow: 'hidden' },
  });

/** Grey blocks in the shape of the list: two orders, so it does not jump when the saved orders arrive. */
function OrdersSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        {[0, 1].map((index) => (
          <View key={index} style={styles.card}>
            <View style={styles.head}>
              <SkeletonLine size="base" width="40%" />
              <Skeleton width={56} height={20} rounded={radius.full} />
            </View>
            <Skeleton width={120} height={36} rounded={radius.md} />
            <SkeletonLine size="sm" width="65%" />
            <SkeletonLine size="sm" width="80%" />
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}

/** One order: its number and total, pictures of what was in it, how it is going or how it ended, and the money. */
function OrderCard({ tracked, active }: { tracked: TrackedOrder; active: boolean }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const dateTime = useDateTimeLabel();
  const { order } = tracked;
  const ended = endNoteOf(order) !== null;
  const number = orderNumber(order.id);

  // One line of the card's state: what is happening now, or how it ended and when.
  const state = active
    ? t(`tracking.headline.${headlineOf(order)}`)
    : `${t(`orders.status.${order.status}`)} · ${dateTime(lastEventAt(order))}`;
  const amount = formatRupees(order.total);
  const money =
    order.payment.status === 'refunding'
      ? t('orders.refunding', { amount })
      : ended
        ? t('orders.nothingCharged')
        : order.payment.method === 'upi'
          ? t('orders.payUpi', { amount })
          : order.payment.status === 'paid'
            ? t('orders.paidCash', { amount })
            : t('orders.payCod', { amount });

  return (
    <Pressable
      role="link"
      onPress={() => {
        router.push({ pathname: '/order', params: { id: order.id } });
      }}
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && { opacity: 0.85 },
      ]}
      aria-label={`${t('orders.card', { number })}, ${state}`}
    >
      <View style={styles.head}>
        <Text variant="subheading" role="heading">
          {t('orders.card', { number })}
        </Text>
        <Text variant="strong" color={ended ? 'inkMuted' : 'accentInk'} strike={ended}>
          {amount}
        </Text>
      </View>
      <ThumbRow items={order.items} ring={colors.surface} />
      <Text variant="strong" color={ended ? 'danger' : 'ink'}>
        {state}
      </Text>
      <Text variant="small" color="inkMuted">
        {t('orders.items', { shops: order.shops.map((shop) => shop.name).join(', ') })}
      </Text>
      <Text variant="small" color="inkMuted">
        {money}
      </Text>
      {active ? (
        <View style={styles.track}>
          <Text variant="strong" color="accentInk">
            {t('orders.track')}
          </Text>
          <Icon name="chevronRight" color={colors.accentInk} size={16} />
        </View>
      ) : null}
    </Pressable>
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

  const { active, past } = splitOrders(orders);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text variant="strong" color="inkMuted" role="heading">
          {t('orders.inProgress')}
        </Text>
        {active.length === 0 ? (
          <View style={styles.quiet}>
            <Text variant="small" color="inkMuted">
              {t('orders.nothingInProgress')}
            </Text>
          </View>
        ) : (
          active.map((tracked) => <OrderCard key={tracked.order.id} tracked={tracked} active />)
        )}
      </View>
      {past.length > 0 ? (
        <View style={styles.section}>
          <Text variant="strong" color="inkMuted" role="heading">
            {t('orders.past')}
          </Text>
          {past.map((tracked) => (
            <OrderCard key={tracked.order.id} tracked={tracked} active={false} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

/** The Orders tab: orders in progress first, then the ones that are over, newest first. Each opens its own page. */
export function OrdersView() {
  const { loaded } = useOrders();
  const load = useScreenLoad({ loadMs: SETTINGS_LOAD_MS, policy: SETTINGS_POLICY, hold: !loaded });
  return (
    <LoadGate load={load} skeleton={<OrdersSkeleton />}>
      <OrdersList />
    </LoadGate>
  );
}
