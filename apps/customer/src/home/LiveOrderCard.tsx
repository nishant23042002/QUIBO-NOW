import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { activeOrder } from '@/orders/activeOrder';
import { useOrders } from '@/orders/OrdersProvider';
import { shopParts, timelineOf } from '@/orders/timeline';
import { dayRelativeTo, etaOf, headlineOf } from '@/orders/tracking';
import { useStyles, type ThemeColors } from '@/theme';
import { Text, radius, space } from '@/ui';
import { useSlotText } from './slotText';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: space[4], paddingBottom: space[3] },
    card: {
      gap: space[2],
      padding: space[3],
      borderRadius: radius.lg,
      backgroundColor: c.headerBgEnd,
      borderWidth: 1,
      borderColor: c.onHeaderMuted,
    },
    kickerRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.accent },
    steps: { flexDirection: 'row', gap: space[1] },
    step: {
      flex: 1,
      height: 6,
      borderRadius: radius.sm,
      backgroundColor: c.onHeaderMuted,
      opacity: 0.35,
    },
    stepOn: { backgroundColor: c.accent, opacity: 1 },
    foot: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    words: { flex: 1, minWidth: 0 },
    track: {
      minHeight: space[10],
      justifyContent: 'center',
      paddingHorizontal: space[4],
      borderRadius: radius.md,
      backgroundColor: c.accent,
    },
    pressed: { opacity: 0.9 },
  });

/**
 * The live order, on Home's canvas above the mosaic, while an order is still going: when it is expected (a range or a window,
 * never a countdown), where it is in a few segments, and the shops packing it. One tap opens its tracking page. It is not there
 * when there is no order in progress.
 */
export function LiveOrderCard() {
  const { t } = useLanguage();
  const router = useRouter();
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
  const headline = t(`tracking.headline.${headlineOf(order)}`);
  const steps = timelineOf(order);
  const names = shopParts(order)
    .map((shop) => shop.name)
    .join(', ');

  return (
    <View style={styles.wrap}>
      <Pressable
        role="button"
        aria-label={`${t('home.live.kicker')}. ${arrival}. ${headline}`}
        onPress={() => {
          router.push({ pathname: '/order', params: { id: order.id } });
        }}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.kickerRow}>
          <View style={styles.dot} aria-hidden />
          <Text variant="caption" color="accent" numberOfLines={1}>
            {t('home.live.kicker')}
          </Text>
        </View>
        <Text variant="subheading" color="onHeader" numberOfLines={2}>
          {arrival}
        </Text>
        <View style={styles.steps} aria-hidden>
          {steps.map((step) => (
            <View
              key={step.status}
              style={[
                styles.step,
                (step.state === 'done' || step.state === 'current') && styles.stepOn,
              ]}
            />
          ))}
        </View>
        <View style={styles.foot}>
          <View style={styles.words}>
            <Text variant="strong" color="onHeader" numberOfLines={2}>
              {headline}
            </Text>
            <Text variant="fine" color="onHeaderMuted" numberOfLines={2}>
              {t('home.live.shops', { names })}
            </Text>
          </View>
          <View style={styles.track} aria-hidden>
            <Text variant="strong" color="onAccent" numberOfLines={1}>
              {t('home.live.track')}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
