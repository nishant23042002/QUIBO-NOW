import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { activeOrder } from '@/orders/activeOrder';
import { useOrders } from '@/orders/OrdersProvider';
import { shopParts, timelineOf } from '@/orders/timeline';
import { MOCK_RIDER, dayRelativeTo, etaOf, riderShown } from '@/orders/tracking';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { GlassPanel, Icon, Text, radius, space } from '@/ui';
import { useSlotText } from './slotText';

const TILE = 40;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: space[4], paddingBottom: space[3] },
    panel: { padding: space[4], gap: space[3] },
    kickerRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.accent },
    steps: { flexDirection: 'row', gap: space[1] },
    stepCell: { flex: 1, gap: space[2] },
    segment: {
      height: 6,
      borderRadius: radius.sm,
      backgroundColor: c.onHeaderMuted,
      opacity: 0.35,
    },
    // A step that is done is solid; the one being worked on is the same colour, half strength; the rest wait.
    segmentOn: { backgroundColor: c.accent, opacity: 1 },
    segmentNow: { backgroundColor: c.accent, opacity: 0.55 },
    foot: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    tile: {
      width: TILE,
      height: TILE,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.onHeaderMuted,
    },
    words: { flex: 1, minWidth: 0 },
    track: {
      minHeight: space[10],
      justifyContent: 'center',
      paddingHorizontal: space[4],
      borderRadius: radius.md,
      backgroundColor: c.accent,
    },
    pressed: { opacity: 0.92 },
  });

const KICKER = {
  placed: 'home.live.kickerPlaced',
  accepted: 'home.live.kickerPacking',
  ready: 'home.live.kickerReady',
  picked_up: 'home.live.kickerWay',
} as const;

const STEP = {
  accepted: 'home.live.stepAccepted',
  ready: 'home.live.stepReady',
  picked_up: 'home.live.stepWay',
  delivered: 'home.live.stepDelivered',
} as const;

/**
 * The live order, on Home's canvas above the mosaic, while an order is still going (ADR 0055): what state it is in, when it is
 * expected (a range or a window, never a countdown), four steps with their names, who is packing it and, once it is packed, who
 * is bringing it. One tap opens its tracking page. It is not there when there is no order in progress.
 */
export function LiveOrderCard() {
  const { t } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const slotText = useSlotText();
  const { orders } = useOrders();
  const tracked = activeOrder(orders);
  if (tracked === undefined) return null;

  const { order } = tracked;
  const eta = etaOf(order);
  const arrival =
    eta === null
      ? ''
      : eta.kind === 'range'
        ? t('home.live.etaRange', { from: eta.from, to: eta.to })
        : (() => {
            const window = slotText.windowLabel(eta.start.getHours());
            const day = dayRelativeTo(eta.start, new Date());
            return day === 'other'
              ? t('tracking.etaOther', { date: slotText.dateLabel(eta.start), window })
              : t(day === 'today' ? 'tracking.etaToday' : 'tracking.etaTomorrow', { window });
          })();

  const kicker =
    order.status === 'placed' ||
    order.status === 'accepted' ||
    order.status === 'ready' ||
    order.status === 'picked_up'
      ? t(KICKER[order.status])
      : '';
  // "Placed" is always done by the time the card is there, so the steps start at the shop's acceptance.
  const steps = timelineOf(order).filter((step) => step.status !== 'placed');

  const names = shopParts(order).map((shop) => shop.name);
  const [first, second] = names;
  const joined =
    first === undefined
      ? ''
      : names.length === 1
        ? first
        : names.length === 2 && second !== undefined
          ? t('home.live.two', { a: first, b: second })
          : t('home.live.many', { first, count: names.length - 1 });
  const line = riderShown(order)
    ? t('home.live.packed', { names: joined, rider: MOCK_RIDER.name })
    : t('home.live.packing', { names: joined });

  return (
    <View style={styles.wrap}>
      <Pressable
        role="button"
        aria-label={`${kicker}. ${arrival}. ${line}`}
        onPress={() => {
          router.push({ pathname: '/order', params: { id: order.id } });
        }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <GlassPanel style={styles.panel}>
          <View style={styles.kickerRow}>
            <View style={styles.dot} aria-hidden />
            <Text variant="strong" color="accent" numberOfLines={1}>
              {kicker}
            </Text>
          </View>
          <Text variant="heading" color="onHeader" numberOfLines={2}>
            {arrival}
          </Text>
          <View style={styles.steps} aria-hidden>
            {steps.map((step) => {
              const done = step.state === 'done';
              const now = step.state === 'current';
              const on = done || now;
              const label =
                step.status === 'accepted' ||
                step.status === 'ready' ||
                step.status === 'picked_up' ||
                step.status === 'delivered'
                  ? t(STEP[step.status])
                  : '';
              return (
                <View key={step.status} style={styles.stepCell}>
                  <View
                    style={[styles.segment, done && styles.segmentOn, now && styles.segmentNow]}
                  />
                  <Text
                    variant="caption"
                    color={on ? 'onHeader' : 'onHeaderMuted'}
                    numberOfLines={2}
                    maxFontSizeMultiplier={1.2}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.foot}>
            <View style={styles.tile} aria-hidden>
              <Icon name="store" color={colors.onHeader} size={22} />
            </View>
            <View style={styles.words}>
              <Text variant="small" color="onHeaderMuted" numberOfLines={4}>
                {line}
              </Text>
            </View>
            <View style={styles.track} aria-hidden>
              <Text variant="strong" color="onAccent" numberOfLines={1}>
                {t('home.live.track')}
              </Text>
            </View>
          </View>
        </GlassPanel>
      </Pressable>
    </View>
  );
}
