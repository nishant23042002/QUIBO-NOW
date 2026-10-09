import { formatRupees, type PaymentMethod } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { effectivePayment, paymentOptions, shopLines } from '@/orders/checkout';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  BillSummary,
  Button,
  Icon,
  LoadGate,
  Notice,
  PopOnChange,
  PopoverHost,
  QTile,
  StatePanel,
  Text,
  radius,
  space,
  useLargeText,
  useScreenLoad,
} from '@/ui';
import { useAddresses } from './AddressProvider';
import { useBillRows } from './billRows';
import { useCart } from './CartProvider';
import { CHECKOUT_DOCK, CheckoutSkeleton } from './CheckoutSkeleton';
import { ZONE } from './delivery';
import { useDeliveryAddress, useDeliveryWhen } from './deliveryInfo';
import { STEP_LOAD_MS, STEP_POLICY } from './loading';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    // Cards sit 12 from the screen's edges with 12 between them, and 16 inside, as on the cart page.
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    block: { gap: space[3], padding: space[4] },
    head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // When it arrives and where it goes, each with a way to change it.
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      alignContent: 'center',
      rowGap: space[2],
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    rowIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
    },
    // Takes what is left, but not less than a readable line: with large text the button drops under it instead of squeezing it.
    rowText: { flexGrow: 1, flexShrink: 1, flexBasis: 100, minWidth: 0 },
    change: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: space[2],
    },
    shop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      minHeight: 32,
    },
    shopName: { flexShrink: 1, minWidth: 0 },
    option: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    optionOn: { borderColor: c.action },
    optionOff: { backgroundColor: c.muted },
    radio: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.ctl,
    },
    radioOn: { borderColor: c.action },
    radioDot: { width: 12, height: 12, borderRadius: radius.full, backgroundColor: c.action },
    optionText: { flex: 1, minWidth: 0 },
    dock: {
      position: 'absolute',
      left: 0,
      right: 0,
      minHeight: CHECKOUT_DOCK,
      paddingVertical: space[3],
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      alignContent: 'center',
      rowGap: space[2],
      gap: space[4],
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    dockTotal: { flexShrink: 0 },
    dockCaption: { flexDirection: 'row', gap: space[1] },
    // Beside the total, or under it at full width when large text leaves no room.
    dockButton: { flexGrow: 1, flexBasis: 150 },
    empty: { flex: 1, minHeight: 300 },
  });

/**
 * The last look before an order is placed. The cart is where things are changed, so this page does not list the items again: it
 * says when the order arrives and where it goes (each with a way to change it), which shops it comes from, how it will be paid,
 * and the same bill as the cart. Cash on delivery is offered up to the zone's limit for a new customer; above it the shopper
 * pays by UPI. The bar at the bottom holds the total and the button. Ordering needs a connection, so with none the button waits.
 */
function CheckoutPage() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCart();
  const addresses = useAddresses();
  const online = useOnline();
  const when = useDeliveryWhen();
  const address = useDeliveryAddress();
  const rows = useBillRows();
  const large = useLargeText();
  const [chosen, setChosen] = useState<PaymentMethod | null>(null);
  const [dockHeight, setDockHeight] = useState(CHECKOUT_DOCK);
  const room = insets.bottom + BOTTOM_BAR_HEIGHT;
  const { bill } = cart;

  if (!cart.ready) return null;

  if (cart.count === 0) {
    return (
      <View style={styles.page}>
        <View style={styles.empty}>
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
      </View>
    );
  }

  const method = effectivePayment(chosen, bill.toPay);
  const options = paymentOptions(bill.toPay);
  const shops = shopLines(cart.items, t('cart.darkStore'));
  const hasAddress = addresses.selected !== undefined;
  const quick = when.quick;
  const methodTitle = method === 'cod' ? t('checkout.codTitle') : t('checkout.upiTitle');

  return (
    <PopoverHost style={styles.page}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: room + dockHeight + space[6] }]}
        showsVerticalScrollIndicator={false}
      >
        {online ? null : <Notice tone="info" icon="wifiOff" message={t('cart.offline')} />}
        {hasAddress ? null : <Notice tone="warning" icon="pin" message={t('checkout.noAddress')} />}
        <View style={styles.card}>
          <View style={styles.row}>
            <View aria-hidden>
              {quick ? (
                <QTile size={40} label={t('app.name')} />
              ) : (
                <View style={styles.rowIcon}>
                  <Icon name="clock" color={colors.accentInk} size={20} />
                </View>
              )}
            </View>
            <View style={styles.rowText}>
              <Text variant="strong" numberOfLines={2}>
                {when.headline}
              </Text>
              {quick ? (
                <Text variant="small" color="inkMuted">
                  {t('checkout.estimate')}
                </Text>
              ) : null}
            </View>
            <Pressable
              role="link"
              aria-label={t('checkout.changeTime')}
              hitSlop={6}
              onPress={() => {
                router.push('/schedule');
              }}
              style={({ pressed }) => [styles.change, pressed && { opacity: 0.7 }]}
            >
              <Text variant="strong" color="accentInk">
                {t('cart.change')}
              </Text>
            </Pressable>
          </View>
          <View style={[styles.row, styles.divided]}>
            <View style={styles.rowIcon} aria-hidden>
              <Icon name="pin" color={colors.accentInk} size={20} />
            </View>
            <View style={styles.rowText}>
              <Text variant="fine" color="inkMuted">
                {t('trust.deliveringTo')}
              </Text>
              <Text variant="small" numberOfLines={large ? 3 : 2}>
                {address}
              </Text>
            </View>
            <Pressable
              role="link"
              aria-label={t('checkout.changeAddress')}
              hitSlop={6}
              onPress={() => {
                router.push('/address');
              }}
              style={({ pressed }) => [styles.change, pressed && { opacity: 0.7 }]}
            >
              <Text variant="strong" color="accentInk">
                {t('cart.change')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, styles.block]}>
          <View style={styles.head}>
            <Icon name="bag" color={colors.accentInk} size={20} />
            <Text variant="subheading" role="heading">
              {t('checkout.yourOrder')}
            </Text>
          </View>
          <View>
            {shops.map((shop) => (
              <View key={shop.name} style={styles.shop}>
                <View style={styles.shopName}>
                  <Text numberOfLines={large ? 2 : 1}>{shop.name}</Text>
                </View>
                <Text variant="small" color="inkMuted">
                  {t(shop.items === 1 ? 'home.cart.itemsOne' : 'home.cart.itemsMany', {
                    count: shop.items,
                  })}
                </Text>
              </View>
            ))}
          </View>
          {shops.length > 1 ? (
            <Text variant="small" color="inkMuted">
              {t('cart.oneTrip', { count: shops.length })}
            </Text>
          ) : null}
        </View>

        <View style={[styles.card, styles.block]}>
          <Text variant="subheading" role="heading">
            {t('checkout.payTitle')}
          </Text>
          <View role="radiogroup" aria-label={t('checkout.payTitle')} style={{ gap: space[2] }}>
            {options.map((option) => {
              const selected = option.method === method;
              const cod = option.method === 'cod';
              return (
                <Pressable
                  key={option.method}
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={!option.allowed}
                  disabled={!option.allowed}
                  onPress={() => {
                    setChosen(option.method);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionOn,
                    !option.allowed && styles.optionOff,
                    pressed && option.allowed && { backgroundColor: colors.muted },
                  ]}
                >
                  <View style={[styles.radio, selected && styles.radioOn]} aria-hidden>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.optionText}>
                    <Text variant="strong" color={option.allowed ? 'ink' : 'inkMuted'}>
                      {cod ? t('checkout.codTitle') : t('checkout.upiTitle')}
                    </Text>
                    <Text variant="small" color="inkMuted">
                      {!cod
                        ? t('checkout.upiSub')
                        : option.allowed
                          ? t('checkout.codSub', { amount: formatRupees(bill.toPay) })
                          : t('checkout.codOver', {
                              max: formatRupees(ZONE.payment.codMaxNewCustomer),
                            })}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.block]}>
          <View style={styles.head}>
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
          {cart.hasWeighed ? (
            <Text variant="small" color="inkMuted">
              {t('weights.billNote')}
            </Text>
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
        {/* Read out again when the total changes, so a shopper using a screen reader hears what the change did to the bill. */}
        <View style={styles.dockTotal} accessible aria-live="polite">
          <PopOnChange value={bill.toPay}>
            <Text variant="subheading">{formatRupees(bill.toPay)}</Text>
          </PopOnChange>
          <View style={styles.dockCaption}>
            <Text variant="fine" color="inkMuted">
              {methodTitle}
            </Text>
            {!online ? (
              <Text variant="caption" color="warning">
                {`· ${t('cart.offlineShort')}`}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.dockButton}>
          {/* Placing the order is the next piece of work (1f-3): until then the button has nothing to do. */}
          <Button label={t('checkout.place')} disabled={!online || !hasAddress} shine />
        </View>
      </View>
    </PopoverHost>
  );
}

/** The checkout page as it opens: its skeleton first, then the page fading in over it. Ordering needs a network, so it is not shown without one. */
export function CheckoutView() {
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const load = useScreenLoad({
    loadMs: STEP_LOAD_MS,
    policy: STEP_POLICY,
    hold: !cart.ready,
  });

  return (
    <LoadGate
      load={load}
      skeleton={
        <CheckoutSkeleton
          shops={Math.max(1, cart.storeCount)}
          bottom={insets.bottom + BOTTOM_BAR_HEIGHT}
        />
      }
    >
      <CheckoutPage />
    </LoadGate>
  );
}
