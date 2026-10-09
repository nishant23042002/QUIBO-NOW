import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
  Popover,
  PopoverHost,
  StatePanel,
  Stepper,
  Text,
  countRule,
  radius,
  space,
  type BillRow,
} from '@/ui';
import { UndoToast } from './CartLayer';
import { useCart } from './CartProvider';
import { CartSkeleton, LINE_HEIGHT, THUMB } from './CartSkeleton';
import { useTintOf } from './categories';
import { SAMPLE_DISTANCE_KM } from './delivery';
import { DeliveryDetails, HandlingDetails, SavingsDetails, kmLabel } from './PriceDetails';

/** The checkout bar's height: 12 above and below a 48 dp button, and its top line. */
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
    track: { height: 4, borderRadius: radius.full, backgroundColor: c.line },
    fill: { height: 4, borderRadius: radius.full, backgroundColor: c.accentEdge },
    line: {
      height: LINE_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
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
      height: DOCK,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    dockTotal: { flexShrink: 0 },
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
  const room = insets.bottom + BOTTOM_BAR_HEIGHT;
  const { bill } = cart;

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
        contentContainerStyle={[styles.content, { paddingBottom: room + DOCK + space[6] }]}
        showsVerticalScrollIndicator={false}
      >
        {notices}
        <View style={[styles.card, styles.free]} accessible aria-label={cart.hint}>
          <View style={styles.track} aria-hidden>
            <View style={[styles.fill, { width: `${Math.round(cart.progress * 100)}%` }]} />
          </View>
          <Text variant="strong" color={cart.free ? 'accentInk' : 'inkMuted'}>
            {cart.hint}
          </Text>
        </View>
        <View style={styles.card}>
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
            </Popover>
          ) : null}
          <Text variant="small" color="inkMuted">
            {t('cart.taxes')}
          </Text>
        </View>
      </ScrollView>
      <View style={[styles.dock, { bottom: room }]}>
        <View style={styles.dockTotal} accessible>
          <Text variant="subheading">{formatRupees(bill.toPay)}</Text>
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
            onPress={() => {
              router.push('/checkout');
            }}
          />
        </View>
      </View>
      <UndoToast bottom={room + DOCK} />
    </PopoverHost>
  );
}
