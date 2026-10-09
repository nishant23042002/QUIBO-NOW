import { useRouter } from 'expo-router';
import { Text as NativeText, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Icon,
  Notice,
  StatePanel,
  Stepper,
  Text,
  countRule,
  radius,
  space,
} from '@/ui';
import { UndoToast } from './CartLayer';
import { useCart } from './CartProvider';
import { CartSkeleton, LINE_HEIGHT, THUMB } from './CartSkeleton';
import { useTintOf } from './categories';

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
    sum: { gap: space[2], padding: space[4] },
    sumRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    empty: { flex: 1, paddingBottom: BOTTOM_BAR_HEIGHT },
  });

/**
 * The cart page. The whole cart is one order: free delivery is one line for all of it, each shop's part is its own
 * card with its own subtotal (the shop packs that part), and a note says one rider collects everything. Quantities
 * change here with the same steppers as everywhere, and taking the last unit out gives the undo note. An empty cart
 * says so and points back to the shops. The cart is kept on the phone, so it works with no connection; only ordering
 * will need one.
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

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: room + space[6] }]}
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
        {cart.baskets.length > 1 ? (
          <Notice
            tone="info"
            icon="bag"
            message={t('cart.oneTrip', { count: cart.baskets.length })}
          />
        ) : null}
        <View style={[styles.card, styles.sum]}>
          <View style={styles.sumRow}>
            <Text variant="label">{`${t('cart.itemTotal')} · ${cart.itemsLabel}`}</Text>
            <Text variant="subheading">{cart.totalLabel}</Text>
          </View>
          {cart.savedLabel !== undefined ? (
            <Text variant="strong" color="success">
              {cart.savedLabel}
            </Text>
          ) : null}
        </View>
      </ScrollView>
      <UndoToast bottom={room} />
    </View>
  );
}
