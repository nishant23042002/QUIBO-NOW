import { formatRupees, type Order } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from '@/home/loading';
import { formatPhone } from '@/home/phone';
import { useSlotText } from '@/home/slotText';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Icon,
  LoadGate,
  Button,
  Notice,
  Sheet,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  StatePanel,
  Text,
  fontSize,
  radius,
  space,
  textLines,
  useLargeText,
  useScreenLoad,
  useChromeScroll,
} from '@/ui';
import { canCancel } from './machine';
import { orderNumber } from './ids';
import { ItemLine } from './ItemThumb';
import { useOrders } from './OrdersProvider';
import { useDateTimeLabel, useTimeLabel } from './useTime';
import { shopParts, timelineOf, type StepState } from './timeline';
import {
  MOCK_RIDER,
  cashToKeep,
  dayRelativeTo,
  endNoteOf,
  endedBy,
  etaOf,
  headlineOf,
  mockShopPhone,
  reachedOn,
  riderShown,
  shopsCallable,
} from './tracking';

const NODE = 24;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    block: { gap: space[2], padding: space[4] },
    // What is happening now, on the app's dark colour so it is the first thing seen.
    hero: { gap: space[1], padding: space[4], borderRadius: radius.lg, backgroundColor: c.chrome },
    step: { flexDirection: 'row', gap: space[3] },
    rail: { width: NODE, alignItems: 'center' },
    node: {
      width: NODE,
      height: NODE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      borderWidth: 2,
    },
    nodeDone: { backgroundColor: c.action, borderColor: c.action },
    nodeCurrent: { backgroundColor: c.lilac, borderColor: c.action },
    nodeUpcoming: { borderColor: c.ctl },
    nodeStopped: { backgroundColor: c.dangerBg, borderColor: c.danger },
    line: { flex: 1, width: 2, backgroundColor: c.line, marginVertical: space[1] },
    lineDone: { backgroundColor: c.action },
    stepText: { flex: 1, minWidth: 0, paddingBottom: space[4] },
    stepLast: { paddingBottom: 0 },
    shop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: 48,
    },
    shopName: { flex: 1, minWidth: 0 },
    call: {
      minWidth: 72,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space[3],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.action,
    },
    // Wraps: with a long name for the button (Hindi, Marathi, large text) it drops under the name instead of squeezing it.
    rider: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      alignContent: 'center',
      rowGap: space[2],
      gap: space[3],
      padding: space[4],
    },
    riderIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.lilac,
    },
    grow: { flex: 1, minWidth: 0 },
    riderText: { flexGrow: 1, flexShrink: 1, flexBasis: 120, minWidth: 0 },
    skeleton: { flex: 1, overflow: 'hidden' },
    actions: { gap: space[2] },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: space[3],
    },
    items: { gap: space[3] },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    fact: { flexDirection: 'row', justifyContent: 'space-between', gap: space[4] },
    factValue: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
    sheetActions: { gap: space[2] },
  });

/**
 * The line under the headline: when it will arrive as a range or a window, or how it ended and when. The page draws it and the
 * skeleton counts its lines, so both read it from here.
 */
function useEtaLine(order: Order): string | null {
  const { t } = useLanguage();
  const slotText = useSlotText();
  const time = useTimeLabel();
  const eta = etaOf(order);
  const delivered = reachedOn(order, 'delivered');
  const who = endedBy(order);
  const endedAt = reachedOn(order, order.status);
  return eta === null
    ? who !== null && endedAt !== null
      ? t(`tracking.endedBy.${who}`, { time: time(endedAt) })
      : delivered !== null
        ? t('tracking.deliveredAt', { time: time(delivered) })
        : null
    : eta.kind === 'range'
      ? t('tracking.etaRange', { from: eta.from, to: eta.to })
      : (() => {
          const window = slotText.windowLabel(eta.start.getHours());
          const day = dayRelativeTo(eta.start, new Date());
          return day === 'other'
            ? t('tracking.etaOther', { date: slotText.dateLabel(eta.start), window })
            : t(day === 'today' ? 'tracking.etaToday' : 'tracking.etaTomorrow', { window });
        })();
}

/** The page's layout in grey while the order is not known (it is being read back from the phone). */
function GenericTrackingSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <SkeletonLine size="lg" tight width="70%" />
          <SkeletonLine size="base" width="55%" />
        </View>
        <View style={[styles.card, styles.block]}>
          {[0, 1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.step}>
              <Skeleton width={NODE} height={NODE} rounded={radius.full} />
              <View style={styles.grow}>
                <SkeletonLine size="base" width="45%" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </SkeletonScope>
  );
}

/**
 * Grey blocks in the page's own layout, from the order it will show: the headline and the line under it (taking the lines it wraps
 * to), a step for each place the order has been or will be (a second line under the ones with a time), the shops with their Call
 * buttons, the rider when there is one, a line for each thing, what to pay or what was paid, the buttons, and the details. The
 * same cards, rows and gaps as the page, so each lands where its real one will.
 */
function OrderTrackingSkeleton({ order }: { order: Order }) {
  const { t, locale } = useLanguage();
  const styles = useStyles(makeStyles);
  const { width: screen } = useWindowDimensions();
  const script = locale === 'en' ? 'latin' : 'devanagari';
  const etaLine = useEtaLine(order);
  const steps = timelineOf(order);
  const parts = shopParts(order);
  const endNote = endNoteOf(order);
  const cash = cashToKeep(order);
  const dateTime = useDateTimeLabel();
  // The details card's rows, as the page words them.
  const facts: readonly (readonly [string, string])[] = [
    [t('tracking.detailNumber'), orderNumber(order.id)],
    [t('tracking.detailPlaced'), dateTime(new Date(order.placedAt))],
    [t('tracking.detailAddress'), order.address],
    [t('tracking.detailShops'), order.shops.map((shop) => shop.name).join(', ')],
    [
      t('tracking.detailPayment'),
      order.payment.method === 'upi'
        ? t('tracking.detailUpi', { amount: formatRupees(order.total) })
        : t('tracking.detailCash', { amount: formatRupees(order.total) }),
    ],
  ];
  // Inside a card: the page's gutters, the card's border and its padding.
  const inner = screen - space[3] * 2 - 2 - space[4] * 2;
  const lines = (count: number, size: 'sm' | 'base', last: `${number}%` = '55%') =>
    Array.from({ length: count }, (_, index) => (
      <SkeletonLine
        key={index}
        size={size}
        width={index === count - 1 && count > 1 ? last : '100%'}
      />
    ));
  const paymentBody =
    endNote !== null
      ? endNote.kind === 'refund'
        ? t('tracking.refundBody', { amount: formatRupees(endNote.amount) })
        : t('tracking.nothingBody')
      : cash !== null
        ? t('tracking.keepCash', { amount: formatRupees(cash) })
        : order.payment.method === 'upi'
          ? t('tracking.nothingToPay')
          : order.payment.status === 'paid'
            ? t('tracking.cashCollected', { amount: formatRupees(order.total) })
            : null;

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <SkeletonLine size="lg" tight width="62%" />
          {etaLine !== null
            ? lines(textLines(etaLine, inner, fontSize.base, script), 'base')
            : null}
        </View>

        <View style={[styles.card, styles.block]}>
          {steps.map((step, index) => {
            const last = index === steps.length - 1;
            const second = step.at !== null || step.state === 'current';
            return (
              <View key={step.status} style={styles.step}>
                <View style={styles.rail}>
                  <Skeleton width={NODE} height={NODE} rounded={radius.full} />
                  {last ? null : <View style={styles.line} />}
                </View>
                <View style={[styles.stepText, last && styles.stepLast]}>
                  <SkeletonLine size="base" width="46%" />
                  {second ? <SkeletonLine size="xs" width="28%" /> : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, styles.block]}>
          <SkeletonLine size="lg" tight width="44%" />
          <View>
            {parts.map((shop) => (
              <View key={shop.id} style={styles.shop}>
                <View style={styles.shopName}>
                  <SkeletonLine size="base" width="52%" />
                  {endNote === null ? <SkeletonLine size="xs" width="30%" /> : null}
                </View>
                {shopsCallable(order) ? (
                  <Skeleton width={72} height={40} rounded={radius.md} />
                ) : null}
              </View>
            ))}
          </View>
          {parts.length > 1
            ? lines(textLines(t('tracking.oneRider'), inner, fontSize.sm, script), 'sm')
            : null}
        </View>

        {riderShown(order) ? (
          <View style={[styles.card, styles.rider]}>
            <Skeleton width={40} height={40} rounded={radius.full} />
            <View style={styles.riderText}>
              <SkeletonLine size="base" width="50%" />
              <SkeletonLine size="sm" width="72%" />
            </View>
            <Skeleton width={72} height={40} rounded={radius.md} />
          </View>
        ) : null}

        <View style={[styles.card, styles.block]}>
          <View style={styles.cardHead}>
            <SkeletonLine size="lg" tight width="36%" />
            <SkeletonLine size="sm" width={64} />
          </View>
          <View style={styles.items}>
            {order.items.map((item) => {
              const nameLines = Math.min(
                2,
                textLines(item.name, inner - 44 - 64 - space[3] * 2, fontSize.base, script),
              );
              return (
                <View key={item.packId} style={styles.itemRow}>
                  <Skeleton width={44} height={44} rounded={radius.md} />
                  <View style={styles.grow}>
                    <View>{lines(nameLines, 'base', '60%')}</View>
                    <SkeletonLine size="xs" width="32%" />
                  </View>
                  <Skeleton width={52} height={Math.round(fontSize.sm * 0.8)} />
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.block]}>
          <SkeletonLine size="lg" tight width="48%" />
          {paymentBody !== null
            ? lines(textLines(paymentBody, inner, fontSize.base, script), 'base')
            : null}
        </View>

        {canCancel(order) || endNote !== null ? (
          <View style={styles.actions}>
            <Skeleton height={48} rounded={radius.md} />
          </View>
        ) : null}

        <View style={[styles.card, styles.block]}>
          <SkeletonLine size="lg" tight width="40%" />
          {facts.map(([label, value]) => {
            // The value takes what the label leaves, and wraps to the lines its words need.
            const valueLines = textLines(
              value,
              inner - [...label].length * 7 - space[4],
              fontSize.sm,
              script,
            );
            return (
              <View key={label} style={styles.fact}>
                <SkeletonLine size="sm" width={[...label].length * 7} />
                <View style={styles.factValue}>
                  {Array.from({ length: valueLines }, (_, line) => (
                    <SkeletonLine
                      key={line}
                      size="sm"
                      width={line === valueLines - 1 && valueLines > 1 ? '50%' : '90%'}
                      align="end"
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.actions}>
          <Skeleton height={48} rounded={radius.md} />
        </View>
      </View>
    </SkeletonScope>
  );
}

function Timeline({ order }: { order: Order }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const time = useTimeLabel();
  const steps = timelineOf(order);

  return (
    <View style={[styles.card, styles.block]} accessible={false}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const state: StepState = step.state;
        return (
          <View
            key={step.status}
            style={styles.step}
            accessible
            aria-label={[
              t(`tracking.step.${step.status}`),
              step.at !== null
                ? time(new Date(step.at))
                : state === 'current'
                  ? t('tracking.inProgress')
                  : '',
            ]
              .filter((part) => part !== '')
              .join(', ')}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.node,
                  state === 'done' && styles.nodeDone,
                  state === 'current' && styles.nodeCurrent,
                  state === 'upcoming' && styles.nodeUpcoming,
                  state === 'stopped' && styles.nodeStopped,
                ]}
              >
                {state === 'done' ? <Icon name="check" color={colors.onAction} size={14} /> : null}
                {state === 'stopped' ? <Icon name="close" color={colors.danger} size={14} /> : null}
              </View>
              {last ? null : <View style={[styles.line, state === 'done' && styles.lineDone]} />}
            </View>
            <View style={[styles.stepText, last && styles.stepLast]}>
              <Text
                variant={state === 'upcoming' ? 'body' : 'label'}
                color={state === 'upcoming' ? 'inkMuted' : 'ink'}
              >
                {t(`tracking.step.${step.status}`)}
              </Text>
              {step.at !== null ? (
                <Text variant="fine" color="inkMuted">
                  {time(new Date(step.at))}
                </Text>
              ) : state === 'current' ? (
                <Text variant="fine" color="accentInk">
                  {t('tracking.inProgress')}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function call(phone: string): void {
  void Linking.openURL(`tel:+91${phone}`).catch(() => undefined);
}

function TrackingPage({ order }: { order: Order }) {
  const { t } = useLanguage();
  const chromeScroll = useChromeScroll();
  const router = useRouter();
  const { cancel } = useOrders();
  const [asking, setAsking] = useState(false);
  const [tooLate, setTooLate] = useState(false);
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const large = useLargeText();
  const dateTime = useDateTimeLabel();
  const { colors } = useTheme();

  const cash = cashToKeep(order);
  const parts = shopParts(order);
  const endNote = endNoteOf(order);
  const etaLine = useEtaLine(order);

  return (
    <ScrollView
      {...chromeScroll}
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {online ? null : <Notice tone="info" icon="wifiOff" message={t('tracking.offline')} />}
      <View style={styles.hero} accessible aria-live="polite">
        <Text variant="subheading" color="onChrome">
          {t(`tracking.headline.${headlineOf(order)}`)}
        </Text>
        {etaLine !== null ? <Text color="onChromeMuted">{etaLine}</Text> : null}
      </View>

      <Timeline order={order} />

      <View style={[styles.card, styles.block]}>
        <Text variant="subheading" role="heading">
          {t('tracking.yourShops')}
        </Text>
        <View>
          {parts.map((shop, index) => (
            <View key={shop.id} style={styles.shop}>
              <View style={styles.shopName}>
                <Text numberOfLines={large ? 2 : 1}>{shop.name}</Text>
                {endNote === null ? (
                  <Text variant="fine" color="inkMuted">
                    {t(`tracking.part.${shop.part}`)}
                  </Text>
                ) : null}
              </View>
              {shopsCallable(order) ? (
                <Pressable
                  role="button"
                  aria-label={t('tracking.callShop', { name: shop.name })}
                  hitSlop={4}
                  onPress={() => {
                    call(mockShopPhone(index));
                  }}
                  style={({ pressed }) => [styles.call, pressed && { opacity: 0.7 }]}
                >
                  <Text variant="strong" color="accentInk">
                    {t('tracking.call')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
        {parts.length > 1 ? (
          <Text variant="small" color="inkMuted">
            {t('tracking.oneRider')}
          </Text>
        ) : null}
      </View>

      {riderShown(order) ? (
        <View style={[styles.card, styles.rider]}>
          <View style={styles.riderIcon} aria-hidden>
            <Icon name="user" color={colors.action} size={22} />
          </View>
          <View style={styles.riderText}>
            <Text variant="label">{t('tracking.yourRider')}</Text>
            <Text variant="small" color="inkMuted">
              {`${MOCK_RIDER.name} · ${formatPhone(MOCK_RIDER.phone)}`}
            </Text>
          </View>
          <Pressable
            role="button"
            aria-label={t('tracking.callRiderLabel', { name: MOCK_RIDER.name })}
            hitSlop={4}
            onPress={() => {
              call(MOCK_RIDER.phone);
            }}
            style={({ pressed }) => [styles.call, pressed && { opacity: 0.7 }]}
          >
            <Text variant="strong" color="accentInk">
              {t('tracking.callRider')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.card, styles.block]}>
        <View style={styles.cardHead}>
          <Text variant="subheading" role="heading">
            {t('tracking.itemsTitle')}
          </Text>
          <Text variant="small" color="inkMuted">
            {t(order.items.length === 1 ? 'home.cart.itemsOne' : 'home.cart.itemsMany', {
              count: order.items.length,
            })}
          </Text>
        </View>
        <View style={styles.items}>
          {order.items.map((item) => (
            <ItemLine key={item.packId} item={item} />
          ))}
        </View>
      </View>

      {endNote !== null ? (
        <View style={[styles.card, styles.block]}>
          <Text variant="subheading" role="heading">
            {endNote.kind === 'refund' ? t('tracking.refundTitle') : t('tracking.nothingTitle')}
          </Text>
          <Text color="inkMuted">
            {endNote.kind === 'refund'
              ? t('tracking.refundBody', { amount: formatRupees(endNote.amount) })
              : t('tracking.nothingBody')}
          </Text>
        </View>
      ) : (
        <View style={[styles.card, styles.block]}>
          {cash !== null ? (
            <>
              <Text variant="subheading" role="heading">
                {t('tracking.payDoor')}
              </Text>
              <Text color="inkMuted">{t('tracking.keepCash', { amount: formatRupees(cash) })}</Text>
            </>
          ) : order.payment.method === 'upi' ? (
            <>
              <Text variant="subheading" role="heading">
                {t('tracking.paidUpi')}
              </Text>
              <Text color="inkMuted">{t('tracking.nothingToPay')}</Text>
            </>
          ) : order.payment.status === 'paid' ? (
            <>
              <Text variant="subheading" role="heading">
                {t('tracking.paidCash')}
              </Text>
              <Text color="inkMuted">
                {t('tracking.cashCollected', { amount: formatRupees(order.total) })}
              </Text>
            </>
          ) : null}
        </View>
      )}

      {tooLate ? <Notice tone="warning" icon="info" message={t('tracking.tooLate')} /> : null}
      {canCancel(order) ? (
        <View style={styles.actions}>
          <Button
            label={t('tracking.cancel')}
            variant="secondary"
            disabled={!online}
            onPress={() => {
              setAsking(true);
            }}
          />
          {online ? null : (
            <Text variant="small" color="inkMuted" align="center">
              {t('tracking.cancelOffline')}
            </Text>
          )}
        </View>
      ) : null}
      {endNote !== null ? (
        <View style={styles.actions}>
          <Button
            label={t('tracking.backToShopping')}
            variant="secondary"
            onPress={() => {
              router.navigate('/');
            }}
          />
        </View>
      ) : null}

      <View style={[styles.card, styles.block]}>
        <Text variant="subheading" role="heading">
          {t('tracking.detailsTitle')}
        </Text>
        {[
          [t('tracking.detailNumber'), orderNumber(order.id)],
          [t('tracking.detailPlaced'), dateTime(new Date(order.placedAt))],
          [t('tracking.detailAddress'), order.address],
          [t('tracking.detailShops'), order.shops.map((shop) => shop.name).join(', ')],
          [
            t('tracking.detailPayment'),
            order.payment.method === 'upi'
              ? t('tracking.detailUpi', { amount: formatRupees(order.total) })
              : t('tracking.detailCash', { amount: formatRupees(order.total) }),
          ],
        ].map(([label, value]) => (
          <View key={label} style={styles.fact}>
            <Text variant="small" color="inkMuted">
              {label}
            </Text>
            <View style={styles.factValue}>
              <Text variant="small">{value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          label={t('help.needHelpOrder')}
          variant="secondary"
          onPress={() => {
            router.push({ pathname: '/help', params: { orderId: order.id } });
          }}
        />
      </View>

      <Sheet
        open={asking}
        onClose={() => {
          setAsking(false);
        }}
        title={t('tracking.cancelTitle')}
        closeLabel={t('common.close')}
        footer={
          <View style={styles.sheetActions}>
            <Button
              label={t('tracking.cancelConfirm')}
              onPress={() => {
                setAsking(false);
                if (cancel(order.id) === 'too_late') setTooLate(true);
              }}
            />
            <Button
              label={t('tracking.cancelKeep')}
              variant="secondary"
              onPress={() => {
                setAsking(false);
              }}
            />
          </View>
        }
      >
        <Text color="inkMuted">
          {order.payment.method === 'upi'
            ? t('tracking.cancelBodyUpi', { amount: formatRupees(order.total) })
            : t('tracking.cancelBodyCod')}
        </Text>
      </Sheet>
    </ScrollView>
  );
}

/** One order's page: where it is, step by step, and who to call. It follows the order as the clock moves it along. */
export function TrackingView({ id }: { id: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { find, loaded } = useOrders();
  const load = useScreenLoad({ loadMs: SETTINGS_LOAD_MS, policy: SETTINGS_POLICY, hold: !loaded });
  const tracked = find(id);

  return (
    <LoadGate
      load={load}
      skeleton={
        tracked === undefined ? (
          <GenericTrackingSkeleton />
        ) : (
          <OrderTrackingSkeleton order={tracked.order} />
        )
      }
    >
      {!loaded ? null : tracked === undefined ? (
        <StatePanel
          icon="receipt"
          title={t('tracking.notFoundTitle')}
          body={t('tracking.notFoundBody')}
          actionLabel={t('tracking.notFoundAction')}
          onAction={() => {
            router.navigate('/orders');
          }}
        />
      ) : (
        <TrackingPage order={tracked.order} />
      )}
    </LoadGate>
  );
}
