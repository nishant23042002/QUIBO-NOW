import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SETTINGS_POLICY, TAB_LOAD_MS } from '@/home/loading';
import { useTabHeaderProps } from '@/home/useTabHeader';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Chip,
  Icon,
  LoadGate,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  StatePanel,
  TabHeader,
  Text,
  radius,
  space,
  useChromeReport,
  useScreenLoad,
} from '@/ui';
import { orderNumber } from './ids';
import { FIRST_ORDERS_SHAPE, ordersShape, type OrdersShape } from './ordersShape';
import { ThumbRow } from './ItemThumb';
import type { TrackedOrder } from './machine';
import { useOrders } from './OrdersProvider';
import { lastEventAt, splitOrders } from './split';
import { endNoteOf, headlineOf } from './tracking';
import { useDateTimeLabel } from './useTime';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingHorizontal: space[4], paddingTop: space[4] },
    filters: { flexDirection: 'row', gap: space[2] },
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
    empty: { minHeight: 360 },
    emptySkeleton: {
      minHeight: 360,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[3],
      paddingHorizontal: space[6],
    },
    headTitle: { flex: 1, minWidth: 0 },
    thumbs: { flexDirection: 'row', alignItems: 'center' },
    thumbRing: {
      borderRadius: radius.md + 2,
      borderWidth: 2,
      borderColor: c.surface,
      backgroundColor: c.surface,
    },
    thumbOverlap: { marginLeft: -THUMB * 0.28 },
    skeleton: { flex: 1, overflow: 'hidden' },
  });

/** The widths of the lines of the card, as a share of it: the state line and the money line. */
const STATE_WIDTH = '62%';
const MONEY_WIDTH = '48%';
const THUMB = 36;
/** About how many letters the shops line holds before it takes the whole width ("Items from ..." is the longer line). */
const SHOPS_LINE_LETTERS = 40;

/**
 * Grey blocks in the shape of the list the page will show: a card for each order under the chosen filter (up to three), each with its
 * number and total, its row of pictures (as many as the order has), the state line, the shops line (as long as the shop names) and
 * the money line, and the "Track" line only for an order in progress. With no orders it is the empty page's picture and words; with
 * none under the filter, the dashed note.
 */
function OrdersSkeleton({ shape }: { shape: OrdersShape }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  if (shape.kind === 'empty') {
    return (
      <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
        <View style={styles.emptySkeleton}>
          <Skeleton width={72} height={72} rounded={radius.full} />
          <SkeletonLine size="lg" tight width="55%" align="center" />
          <SkeletonLine size="sm" width="75%" align="center" />
          <Skeleton width={160} height={48} rounded={radius.lg} />
        </View>
      </SkeletonScope>
    );
  }

  if (shape.kind === 'none') {
    return (
      <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
        <View style={styles.content}>
          <View style={styles.quiet}>
            <SkeletonLine size="sm" width="60%" />
          </View>
        </View>
      </SkeletonScope>
    );
  }

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        {shape.cards.map((card, index) => {
          const shopsShare = Math.min(
            1,
            Math.max(0.35, (card.shopLetters + 12) / SHOPS_LINE_LETTERS),
          );
          return (
            <View key={index} style={[styles.card, card.active && styles.cardActive]}>
              <View style={styles.head}>
                <View style={styles.headTitle}>
                  <SkeletonLine size="lg" tight width="55%" />
                </View>
                <SkeletonLine size="sm" width={56} align="end" />
              </View>
              <View style={styles.thumbs}>
                {Array.from({ length: card.thumbs + (card.more ? 1 : 0) }, (_, thumb) => (
                  <View key={thumb} style={[styles.thumbRing, thumb > 0 && styles.thumbOverlap]}>
                    <Skeleton width={THUMB} height={THUMB} rounded={radius.md} />
                  </View>
                ))}
              </View>
              <SkeletonLine size="sm" width={STATE_WIDTH} />
              <SkeletonLine size="sm" width={`${Math.round(shopsShare * 100)}%`} />
              <SkeletonLine size="sm" width={MONEY_WIDTH} />
              {card.active ? (
                <View style={styles.track}>
                  <SkeletonLine size="sm" width="30%" />
                </View>
              ) : null}
            </View>
          );
        })}
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

type Filter = 'progress' | 'past';

function OrdersList({ filter }: { filter: Filter }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const { orders, loaded } = useOrders();

  if (!loaded) return null;

  if (orders.length === 0) {
    return (
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
    );
  }

  const { active, past } = splitOrders(orders);
  const shown = filter === 'progress' ? active : past;

  return (
    <View style={styles.content}>
      {shown.length === 0 ? (
        <View style={styles.quiet}>
          <Text variant="small" color="inkMuted">
            {filter === 'progress' ? t('orders.nothingInProgress') : t('orders.nothingPast')}
          </Text>
        </View>
      ) : (
        shown.map((tracked) => (
          <OrderCard key={tracked.order.id} tracked={tracked} active={filter === 'progress'} />
        ))
      )}
    </View>
  );
}

/** Uncovering the tab (back from an order) leaves it as it was; choosing it from another tab shows its skeleton. */
const alwaysQuiet = (): boolean => true;

/**
 * The Orders tab, under the header Home wears. In the place where Home keeps its category tabs, two filter chips choose between the
 * orders in progress and the ones that are over (newest first). Until the shopper chooses, it opens on what is in progress, or on
 * the past orders when nothing is. Each order opens its own page.
 */
export function OrdersView() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const header = useTabHeaderProps();
  const reportScroll = useChromeReport();
  const { orders, loaded } = useOrders();
  const [picked, setPicked] = useState<Filter | null>(null);
  const load = useScreenLoad({
    loadMs: TAB_LOAD_MS,
    policy: SETTINGS_POLICY,
    hold: !loaded,
    quietReturn: alwaysQuiet,
    backgroundReady: true,
    freshOnOpen: true,
  });

  const { active, past } = splitOrders(orders);
  const filter: Filter = picked ?? (active.length > 0 || past.length === 0 ? 'progress' : 'past');
  const shown = filter === 'progress' ? active : past;
  const shape = loaded
    ? ordersShape(
        orders.map((tracked) => tracked.order),
        shown.map((tracked) => tracked.order),
        filter === 'progress',
      )
    : FIRST_ORDERS_SHAPE;
  const rail =
    orders.length > 0 ? (
      <View style={styles.filters} role="radiogroup">
        <Chip
          label={
            active.length > 0
              ? `${t('orders.inProgress')} \u00B7 ${active.length}`
              : t('orders.inProgress')
          }
          selected={filter === 'progress'}
          onPress={() => {
            setPicked('progress');
          }}
        />
        <Chip
          label={t('orders.past')}
          selected={filter === 'past'}
          onPress={() => {
            setPicked('past');
          }}
        />
      </View>
    ) : undefined;

  return (
    <TabHeader
      {...header}
      {...(rail !== undefined ? { rail } : {})}
      onScrollY={reportScroll}
      bottomSpace={BOTTOM_BAR_HEIGHT}
    >
      <LoadGate inFlow load={load} skeleton={<OrdersSkeleton shape={shape} />}>
        <OrdersList filter={filter} />
      </LoadGate>
    </TabHeader>
  );
}
