import { add, formatRupees } from '@quibo/contracts';
import type { MessageKey } from '@quibo/i18n';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
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
import { FREE_DELIVERY_FROM, ZONE, type CareClass } from './delivery';

/** The checkout bar's height: 12 above and below a 48 dp button, and its top line. */
const DOCK = 73;

/** The words for each class of care, which explain the handling fee. */
const CARE_NOTE: Readonly<Record<CareClass, MessageKey>> = {
  standard: 'cart.careStandard',
  fresh: 'cart.careFresh',
  chilled: 'cart.careChilled',
  heavy: 'cart.careHeavy',
  fragile: 'cart.careFragile',
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    // Cards sit 12 from the screen's edges with 12 between them, and 16 inside, as on the product page.
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    gutter: { paddingHorizontal: space[3], paddingTop: space[3], gap: space[3] },
    // The strip under the header that says what the order saves; it stays while the page scrolls.
    strip: {
      minHeight: 36,
      marginHorizontal: space[3],
      marginTop: space[3],
      paddingHorizontal: space[3],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
      borderRadius: radius.md,
      backgroundColor: c.accentSubtle,
    },
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
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    shop: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    line: {
      height: LINE_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
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
    foot: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
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
    // The savings card: soft green behind, a white card with each saving inside.
    savings: {
      gap: space[3],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.accentEdge,
      backgroundColor: c.accentSubtle,
    },
    savingsHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
      paddingHorizontal: space[1],
    },
    pill: {
      paddingHorizontal: space[3],
      paddingVertical: space[1],
      borderRadius: radius.md,
      backgroundColor: c.accent,
    },
    savingsRows: {
      borderRadius: radius.md,
      backgroundColor: c.surface,
      paddingHorizontal: space[3],
    },
    savingsRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    divider: { height: 1, backgroundColor: c.line },
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
    dockTotal: { minWidth: 0 },
    dockButton: { flex: 1 },
    empty: { flex: 1 },
  });

/**
 * The cart page. The whole cart is one order: free delivery is one line for all of it, each shop's part is its own
 * card with its own subtotal (the shop packs that part), and a note says one rider collects everything. Under the
 * shops, the bill spells out every charge, including why the handling fee is what it is, and a card shows what the
 * order saves. A strip under the header keeps the saving in view, and a bar above the bottom menu holds the total
 * and the way forward: continue, or how much more the minimum order needs. Quantities change here with the same
 * steppers as everywhere, and taking the last unit out gives the undo note. An empty cart says so and points back
 * to the shops. The cart is kept on the phone, so it works with no connection; only ordering will need one.
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
  const scroll = useRef<ScrollView>(null);
  const savingsAt = useRef(0);
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

  const handlingNote = [
    bill.handling.reason !== undefined ? t(CARE_NOTE[bill.handling.reason]) : '',
    bill.handling.festival ? t('cart.festival') : '',
  ]
    .filter((part) => part !== '')
    .join(' · ');

  const rows: BillRow[] = [
    {
      label: t('cart.itemTotal'),
      amount: bill.itemTotal,
      note: cart.itemsLabel,
      ...(bill.saved > 0 ? { was: bill.printedTotal } : {}),
    },
    bill.delivery.free
      ? {
          label: t('cart.deliveryFee'),
          amount: bill.delivery.fee,
          was: bill.delivery.waived,
          valueLabel: t('cart.free'),
          positive: true,
        }
      : {
          label: t('cart.deliveryFee'),
          amount: bill.delivery.fee,
          note: t('cart.deliveryNote', { amount: formatRupees(FREE_DELIVERY_FROM) }),
        },
    {
      label: t('cart.handlingFee'),
      amount: bill.handling.fee,
      ...(handlingNote !== '' ? { note: handlingNote } : {}),
    },
  ];

  const minimumShort = formatRupees(bill.minimum.shortBy);

  return (
    <View style={styles.page}>
      {bill.totalSaved > 0 ? (
        <Pressable
          role="button"
          onPress={() => {
            scroll.current?.scrollTo({
              y: Math.max(0, savingsAt.current - space[3]),
              animated: true,
            });
          }}
          style={styles.strip}
        >
          <Text variant="strong" color="accentInk" numberOfLines={1}>
            {t('cart.strip', { amount: formatRupees(bill.totalSaved) })}
          </Text>
          <Icon name="chevron" color={colors.accentInk} size={16} />
        </Pressable>
      ) : null}
      <ScrollView
        ref={scroll}
        contentContainerStyle={[styles.content, { paddingBottom: room + DOCK + space[6] }]}
        showsVerticalScrollIndicator={false}
      >
        {notices}
        {bill.minimum.met ? null : (
          <Notice
            tone="warning"
            icon="info"
            message={t('cart.minOrder', {
              min: formatRupees(ZONE.minimumOrder),
              amount: minimumShort,
            })}
          />
        )}
        <View style={[styles.card, styles.free]} accessible aria-label={cart.hint}>
          <View style={styles.track} aria-hidden>
            <View style={[styles.fill, { width: `${Math.round(cart.progress * 100)}%` }]} />
          </View>
          <Text variant="strong" color={cart.free ? 'accentInk' : 'inkMuted'}>
            {cart.hint}
          </Text>
          {cart.baskets.length > 1 ? (
            <Text variant="small" color="inkMuted">
              {t('cart.freeNote')}
            </Text>
          ) : null}
        </View>
        {cart.baskets.map((basket) => (
          <View key={basket.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.shop}>
                <Icon name="store" color={colors.accentInk} size={18} />
                <Text variant="label" numberOfLines={1}>
                  {basket.name}
                </Text>
              </View>
              <Text variant="small" color="inkMuted">
                {t(basket.count === 1 ? 'home.cart.itemsOne' : 'home.cart.itemsMany', {
                  count: basket.count,
                })}
              </Text>
            </View>
            {basket.lines.map((line) => (
              <View key={line.id} style={styles.line}>
                <View
                  style={[styles.thumb, { backgroundColor: tintOf(line.category) }]}
                  aria-hidden
                >
                  <NativeText allowFontScaling={false} style={{ fontSize: 30, lineHeight: 38 }}>
                    {line.emoji}
                  </NativeText>
                </View>
                <View style={styles.name}>
                  <Text variant="strong" numberOfLines={2}>
                    {line.name}
                  </Text>
                  <Text variant="small" color="inkMuted" numberOfLines={1}>
                    {line.pack}
                  </Text>
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
                  <Text variant="strong">{line.totalLabel}</Text>
                </View>
              </View>
            ))}
            <View style={styles.foot}>
              <Text variant="small" color="inkMuted">
                {t('cart.subtotal')}
              </Text>
              <Text variant="label">{basket.totalLabel}</Text>
            </View>
          </View>
        ))}
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
        {cart.baskets.length > 1 ? (
          <Notice
            tone="info"
            icon="bag"
            message={t('cart.oneTrip', { count: cart.baskets.length })}
          />
        ) : null}
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
            {...(bill.totalSaved > 0 ? { totalWas: add(bill.toPay, bill.totalSaved) } : {})}
          />
          <Text variant="small" color="inkMuted">
            {t('cart.taxes')}
          </Text>
        </View>
        {bill.totalSaved > 0 ? (
          <View
            style={styles.savings}
            onLayout={(event) => {
              savingsAt.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.savingsHead}>
              <Text variant="subheading" role="heading" color="accentInk">
                {t('cart.savingsTitle')}
              </Text>
              <View style={styles.pill}>
                <Text variant="label" color="onAccent">
                  {formatRupees(bill.totalSaved)}
                </Text>
              </View>
            </View>
            <View style={styles.savingsRows}>
              {bill.saved > 0 ? (
                <View style={styles.savingsRow}>
                  <Text variant="body">{t('cart.savingsPrinted')}</Text>
                  <Text variant="strong">{formatRupees(bill.saved)}</Text>
                </View>
              ) : null}
              {bill.saved > 0 && bill.delivery.free ? <View style={styles.divider} /> : null}
              {bill.delivery.free ? (
                <View style={styles.savingsRow}>
                  <Text variant="body">{t('cart.savingsDelivery')}</Text>
                  <Text variant="strong">{formatRupees(bill.delivery.waived)}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.dock, { bottom: room }]}>
        <View style={styles.dockTotal} accessible>
          <Text variant="subheading">{formatRupees(bill.toPay)}</Text>
          <Text variant="caption" color="inkMuted">
            {t('cart.toPay')}
          </Text>
        </View>
        <View style={styles.dockButton}>
          <Button
            label={
              bill.minimum.met ? t('cart.continue') : t('cart.addMore', { amount: minimumShort })
            }
            onPress={() => {
              if (bill.minimum.met) router.push('/checkout');
              else router.navigate('/');
            }}
          />
        </View>
      </View>
      <UndoToast bottom={room + DOCK} />
    </View>
  );
}
