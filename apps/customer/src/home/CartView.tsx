import { add, formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  LayoutAnimation,
  Text as NativeText,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  BillSummary,
  Button,
  Icon,
  Notice,
  OfferBadge,
  Popover,
  PopoverHost,
  PopOnChange,
  ProgressBar,
  ShineSweep,
  QTile,
  StatePanel,
  Stepper,
  Text,
  countRule,
  radius,
  space,
  useReduceMotion,
  useScreenFocused,
  type BillRow,
} from '@/ui';
import { UndoToast } from './CartLayer';
import { useCart } from './CartProvider';
import { CartSkeleton, LINE_HEIGHT, THUMB } from './CartSkeleton';
import { useTintOf } from './categories';
import { SAMPLE_DISTANCE_KM } from './delivery';
import { DeliveryDetails, HandlingDetails, SavingsDetails, kmLabel } from './PriceDetails';
import { useSlotText } from './slotText';

/** The checkout bar's least height: 12 above and below a 48 dp button, and its top line. It grows with large text. */
const DOCK = 73;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    // Cards sit 12 from the screen's edges with 12 between them, and 16 inside, as on the product page.
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    gutter: { paddingHorizontal: space[3], paddingTop: space[3], gap: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    free: { gap: space[2], padding: space[4] },
    line: {
      minHeight: LINE_HEIGHT,
      paddingVertical: space[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    // When it arrives, at the top of the items it is about, with a way to change it.
    arrive: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    arriveIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
    },
    arriveText: { flex: 1, minWidth: 0 },
    change: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      paddingHorizontal: space[3],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.action,
    },
    thumb: {
      width: THUMB,
      height: THUMB,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: { flex: 1, minWidth: 0 },
    side: { alignItems: 'flex-end', gap: space[1] },
    price: { flexDirection: 'row', alignItems: 'baseline', gap: space[1] },
    // Who sells it: a small shop mark and the name, short enough for the narrow column.
    sold: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    // One quiet line under the items when they come from more than one store.
    trip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.muted,
    },
    tripText: { flex: 1 },
    // The coupon card: a way into the coupons page, and what is applied or could be.
    coupons: { overflow: 'hidden' },
    couponRow: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    couponNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.accentSubtle,
    },
    couponNoteText: { flex: 1, minWidth: 0 },
    forgot: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      minHeight: 40,
    },
    bill: { gap: space[3], padding: space[4] },
    billHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // "You save ₹8": the good news in one green line, which opens where it comes from.
    // Clips the band of light that crosses the saving to the saving's own rounded shape.
    pillShine: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
      borderRadius: radius.md,
    },
    save: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
      paddingHorizontal: space[3],
      borderRadius: radius.md,
      backgroundColor: c.accentSubtle,
    },
    dock: {
      position: 'absolute',
      left: 0,
      right: 0,
      minHeight: DOCK,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    dockTotal: { flexShrink: 0 },
    dockPrice: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
    dockCaption: { flexDirection: 'row', gap: space[1] },
    dockButton: { flex: 1 },
    empty: { flex: 1 },
  });

/**
 * The cart page. The whole cart is one order, shown as one flat list however many stores it comes from (a dark-store
 * town has just the one): free delivery is one line for all of it, and when partner shops are involved each item says who
 * sells it. Under the items, the bill: one plain line for each charge, the total, and what the order saves; the little
 * (i) beside a charge opens "Why this price?". There is no minimum order. A bar above the bottom menu holds the total and
 * the way forward. Quantities change here with the same steppers as everywhere, and taking the last unit out gives the
 * undo note. An empty cart says so and points back to the shops. The cart is kept on the phone, so it works with no
 * connection; only ordering will need one.
 */
export function CartView() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCart();
  const tintOf = useTintOf();
  const online = useOnline();
  const slotText = useSlotText();
  const room = insets.bottom + BOTTOM_BAR_HEIGHT;
  // How tall the checkout bar really is, so the list's end and the undo note clear it at any text size.
  const [dockHeight, setDockHeight] = useState(DOCK);
  const [pillWidth, setPillWidth] = useState(0);
  const reduceMotion = useReduceMotion();
  const focused = useScreenFocused();
  const { bill, coupon } = cart;
  const current = cart.delivery.current;
  const quick = current?.kind === 'quick';

  // Rows moving to make room, or closing the gap, glide instead of jumping. (Reduced motion: they jump, as before.)
  const glide = () => {
    if (!reduceMotion)
      LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
  };

  const notices = (
    <>
      {online ? null : <Notice tone="info" icon="wifiOff" message={t('cart.offline')} />}
      {cart.restored !== null ? (
        <Notice
          tone="warning"
          icon="info"
          message={[
            cart.restored.gone > 0
              ? t(cart.restored.gone === 1 ? 'cart.goneOne' : 'cart.goneMany', {
                  count: cart.restored.gone,
                })
              : '',
            cart.restored.lowered > 0 ? t('cart.lowered') : '',
          ]
            .filter((part) => part !== '')
            .join(' ')}
          actionLabel={t('cart.gotIt')}
          onAction={cart.dismissRestored}
        />
      ) : null}
    </>
  );

  if (!cart.ready) return <CartSkeleton />;

  if (cart.count === 0) {
    return (
      <View style={styles.page}>
        <View style={styles.gutter}>{notices}</View>
        <View style={[styles.empty, { paddingBottom: room }]}>
          <StatePanel
            icon="bag"
            title={t('cart.emptyTitle')}
            body={t('cart.emptyBody')}
            actionLabel={t('cart.emptyAction')}
            onAction={() => {
              router.navigate('/');
            }}
          />
        </View>
        <UndoToast bottom={room} />
      </View>
    );
  }

  const rows: BillRow[] = [
    { label: t('cart.itemsRow', { count: cart.count }), amount: bill.itemTotal },
    ...(bill.coupon !== undefined
      ? [
          {
            label: t('cart.couponRow', { code: bill.coupon.code }),
            amount: bill.coupon.discount,
            valueLabel: `\u2212${formatRupees(bill.coupon.discount)}`,
            positive: true,
          },
        ]
      : []),
    {
      label: t('cart.deliveryKm', { km: kmLabel(SAMPLE_DISTANCE_KM) }),
      amount: bill.delivery.fee,
      ...(bill.delivery.free ? { valueLabel: t('cart.free'), positive: true } : {}),
      info: <DeliveryDetails bill={bill} distanceKm={SAMPLE_DISTANCE_KM} />,
      infoLabel: t('cart.whyTitle'),
    },
    {
      label: t('cart.handlingFee'),
      amount: bill.handling.fee,
      info: <HandlingDetails bill={bill} />,
      infoLabel: t('cart.whyTitle'),
    },
  ];

  return (
    <PopoverHost style={styles.page}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: room + dockHeight + space[6] }]}
        showsVerticalScrollIndicator={false}
      >
        {notices}
        <View style={[styles.card, styles.free]} accessible aria-label={cart.hint}>
          <ProgressBar progress={cart.progress} done={cart.free} label={cart.hint} />
          <Text variant="strong" color={cart.free ? 'accentInk' : 'inkMuted'}>
            {cart.hint}
          </Text>
        </View>
        <View style={[styles.card, styles.coupons]}>
          <Pressable
            role="button"
            onPress={() => {
              router.push('/coupons');
            }}
            style={styles.couponRow}
          >
            {({ pressed }) => (
              <>
                <OfferBadge
                  state={
                    coupon.applied !== undefined && coupon.applied.discount > 0
                      ? 'applied'
                      : coupon.applied === undefined && coupon.best !== undefined
                        ? 'offer'
                        : 'idle'
                  }
                  pressed={pressed}
                />
                <View style={styles.arriveText}>
                  <Text variant="strong">{t('coupons.viewCoupons')}</Text>
                  <Text variant="small" color="inkMuted">
                    {t('coupons.title')}
                  </Text>
                </View>
                <Icon name="chevronRight" color={colors.inkMuted} size={18} />
              </>
            )}
          </Pressable>
          {coupon.applied !== undefined ? (
            <View style={styles.couponNote}>
              <View style={styles.couponNoteText}>
                {coupon.applied.discount > 0 ? (
                  <>
                    <Text variant="strong" color="accentInk">
                      {t('coupons.applied', { code: coupon.applied.offer.code })}
                    </Text>
                    <Text variant="small" color="inkMuted">
                      {t('coupons.youSave', { amount: formatRupees(coupon.applied.discount) })}
                    </Text>
                  </>
                ) : (
                  <Text variant="strong" color="warning">
                    {t('coupons.shortApplied', {
                      amount: formatRupees(coupon.applied.shortBy),
                      code: coupon.applied.offer.code,
                    })}
                  </Text>
                )}
              </View>
              <Pressable
                role="button"
                hitSlop={6}
                onPress={() => {
                  glide();
                  coupon.remove();
                }}
                style={({ pressed }) => [styles.change, pressed && { opacity: 0.7 }]}
              >
                <Text variant="strong" color="accentInk">
                  {t('coupons.remove')}
                </Text>
              </Pressable>
            </View>
          ) : coupon.best !== undefined ? (
            <View style={styles.couponNote}>
              <View style={styles.couponNoteText}>
                <Text variant="strong" color="accentInk">
                  {t('coupons.bestFor', {
                    amount: formatRupees(coupon.best.discount),
                    code: coupon.best.offer.code,
                  })}
                </Text>
              </View>
              <Pressable
                role="button"
                hitSlop={6}
                onPress={() => {
                  const best = coupon.best;
                  if (best === undefined) return;
                  glide();
                  coupon.apply(best.offer.code);
                }}
                style={({ pressed }) => [styles.change, pressed && { opacity: 0.7 }]}
              >
                <Text variant="strong" color="accentInk">
                  {t('coupons.apply')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        <View style={styles.card}>
          <View style={styles.arrive}>
            <View aria-hidden>
              {quick ? (
                <QTile size={40} label={t('app.name')} />
              ) : (
                <View style={styles.arriveIcon}>
                  <Icon name="clock" color={colors.accentInk} size={20} />
                </View>
              )}
            </View>
            <View style={styles.arriveText}>
              <Text variant="strong" numberOfLines={2}>
                {current === undefined
                  ? ''
                  : current.kind === 'quick'
                    ? t('cart.quickTitle', {
                        from: cart.delivery.eta.from,
                        to: cart.delivery.eta.to,
                      })
                    : slotText.arriving(current.slot)}
              </Text>
              <Text variant="small" color="inkMuted">
                {cart.itemsLabel}
              </Text>
            </View>
            <Pressable
              role="button"
              hitSlop={6}
              onPress={() => {
                router.push('/schedule');
              }}
              style={({ pressed }) => [styles.change, pressed && { opacity: 0.7 }]}
            >
              <Icon name="calendar" color={colors.accentInk} size={16} />
              <Text variant="strong" color="accentInk">
                {quick ? t('cart.schedule') : t('cart.change')}
              </Text>
            </Pressable>
          </View>
          {cart.items.map((line, index) => (
            <View key={line.id} style={[styles.line, index > 0 && styles.divided]}>
              <View style={[styles.thumb, { backgroundColor: tintOf(line.category) }]} aria-hidden>
                <NativeText allowFontScaling={false} style={{ fontSize: 30, lineHeight: 38 }}>
                  {line.emoji}
                </NativeText>
              </View>
              <View style={styles.name}>
                <Text variant="strong" numberOfLines={line.soldBy === undefined ? 2 : 1}>
                  {line.name}
                </Text>
                <Text variant="small" color="inkMuted" numberOfLines={1}>
                  {line.pack}
                </Text>
                {line.soldBy !== undefined ? (
                  <View
                    style={styles.sold}
                    accessible
                    aria-label={t('cart.soldBy', { shop: line.soldBy })}
                  >
                    <Icon name="store" color={colors.inkMuted} size={12} />
                    <Text variant="caption" color="inkMuted" numberOfLines={1}>
                      {line.soldBy}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.side}>
                <Stepper
                  value={line.quantity}
                  onChange={(next) => {
                    // A line that goes away lets the ones below it glide up, instead of jumping.
                    if (next === 0) glide();
                    cart.setQuantity(line.id, next);
                  }}
                  addLabel={t('home.rails.add')}
                  decreaseLabel={t('home.rails.removeOne')}
                  increaseLabel={t('home.rails.addOne')}
                  maxLabel={t('home.rails.noMore')}
                  rule={countRule(line.maxQuantity)}
                />
                <View style={styles.price}>
                  {line.mrpLabel !== undefined ? (
                    <Text variant="small" color="inkMuted" strike>
                      {line.mrpLabel}
                    </Text>
                  ) : null}
                  <Text variant="strong">{line.totalLabel}</Text>
                </View>
              </View>
            </View>
          ))}
          {cart.storeCount > 1 ? (
            <View style={styles.trip}>
              <Icon name="bag" color={colors.inkMuted} size={18} />
              <View style={styles.tripText}>
                <Text variant="small" color="inkMuted">
                  {t('cart.oneTrip', { count: cart.storeCount })}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        <View style={styles.forgot}>
          <Text variant="small" color="inkMuted">
            {t('cart.forgot')}
          </Text>
          <Pressable
            role="link"
            hitSlop={8}
            onPress={() => {
              router.navigate('/');
            }}
          >
            <Text variant="strong" color="accentInk">
              {t('cart.addItems')}
            </Text>
          </Pressable>
        </View>
        <View style={[styles.card, styles.bill]}>
          <View style={styles.billHead}>
            <Icon name="receipt" color={colors.accentInk} size={20} />
            <Text variant="subheading" role="heading">
              {t('cart.billTitle')}
            </Text>
          </View>
          <BillSummary
            rows={rows}
            totalLabel={t('cart.toPay')}
            total={bill.toPay}
            closeLabel={t('common.close')}
          />
          {bill.totalSaved > 0 ? (
            <Popover
              content={<SavingsDetails bill={bill} />}
              label={t('cart.savingsTitle')}
              closeLabel={t('common.close')}
              style={styles.save}
            >
              <Text variant="strong" color="accentInk" numberOfLines={1}>
                {t('cart.saveLine', { amount: formatRupees(bill.totalSaved) })}
              </Text>
              <Icon name="chevron" color={colors.accentInk} size={16} />
              {/* A band of light crosses the saving each time it changes, so a saving that just grew is noticed. */}
              <View
                pointerEvents="none"
                style={styles.pillShine}
                onLayout={(event) => {
                  setPillWidth(Math.round(event.nativeEvent.layout.width));
                }}
              >
                <ShineSweep
                  width={pillWidth}
                  color={colors.surface}
                  active={focused}
                  trigger={bill.totalSaved}
                  intensity={0.8}
                />
              </View>
            </Popover>
          ) : null}
          <Text variant="small" color="inkMuted">
            {t('cart.taxes')}
          </Text>
        </View>
      </ScrollView>
      <View
        style={[styles.dock, { bottom: room }]}
        onLayout={(event) => {
          setDockHeight(Math.round(event.nativeEvent.layout.height));
        }}
      >
        <View style={styles.dockTotal} accessible>
          <View style={styles.dockPrice}>
            <PopOnChange value={bill.toPay}>
              <Text variant="subheading">{formatRupees(bill.toPay)}</Text>
            </PopOnChange>
            {bill.totalSaved > 0 ? (
              <Text variant="small" color="inkMuted" strike>
                {formatRupees(add(bill.toPay, bill.totalSaved))}
              </Text>
            ) : null}
          </View>
          <View style={styles.dockCaption}>
            <Text variant="caption" color="inkMuted">
              {t('cart.toPay')}
            </Text>
            {bill.totalSaved > 0 ? (
              <Text variant="caption" color="success">
                {`· ${t('cart.savedShort', { amount: formatRupees(bill.totalSaved) })}`}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.dockButton}>
          <Button
            label={t('cart.continue')}
            shine
            onPress={() => {
              router.push('/checkout');
            }}
          />
        </View>
      </View>
      <UndoToast bottom={room + dockHeight} />
    </PopoverHost>
  );
}
