import { Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Sheet, Stepper, Text, countRule, radius, space } from '@/ui';
import type { DraftCart } from './cart';

interface CartSheetProps {
  open: boolean;
  cart: DraftCart;
  /** The picture colour for a category, the same as on the item's card. */
  tintOf: (category: string) => string;
  onClose: () => void;
}

const THUMB = 40;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    basket: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[3],
      paddingVertical: space[3],
    },
    shop: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // The free-delivery line for the whole cart: how far along it is, and the words.
    freeCart: { gap: space[2] },
    track: { height: 4, borderRadius: radius.full, backgroundColor: c.line },
    fill: { height: 4, borderRadius: radius.full, backgroundColor: c.accentEdge },
    rows: { borderTopWidth: 1, borderTopColor: c.line },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[3],
      paddingVertical: space[2],
    },
    thumb: {
      width: THUMB,
      height: THUMB,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: { flex: 1, minWidth: 0 },
    amount: { minWidth: 52, alignItems: 'flex-end' },
    footer: { gap: space[1] },
    total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  });

/**
 * The cart, grouped by shop. Each shop's items are the part that shop packs, with its own subtotal. The whole
 * cart is one order: one rider collects from every shop and delivers it together, and free delivery is one line
 * for the whole cart. Quantities can be changed here, and the whole cart's total and a note about the shops
 * are pinned below.
 */
export function CartSheet({ open, cart, tintOf, onClose }: CartSheetProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <Sheet
      open={open && cart.count > 0}
      onClose={onClose}
      title={t('home.cart.title')}
      closeLabel={t('common.close')}
      footer={
        <View style={styles.footer}>
          <View style={styles.total}>
            <Text variant="label">{`${cart.itemsLabel} · ${t('home.cart.total')}`}</Text>
            <Text variant="subheading">{cart.totalLabel}</Text>
          </View>
          {cart.baskets.length > 1 ? (
            <Text variant="small" color="inkMuted">
              {t('home.cart.separate', { count: cart.baskets.length })}
            </Text>
          ) : null}
        </View>
      }
    >
      {/* Free delivery counts the whole cart, from every shop together. */}
      <View style={styles.freeCart}>
        <View style={styles.track} aria-hidden>
          <View style={[styles.fill, { width: `${Math.round(cart.progress * 100)}%` }]} />
        </View>
        <Text variant="strong" color={cart.free ? 'accentInk' : 'inkMuted'}>
          {cart.hint}
        </Text>
      </View>
      {cart.baskets.map((basket) => (
        <View key={basket.id} style={styles.basket}>
          <View style={styles.head}>
            <View style={styles.shop}>
              <Icon name="store" color={colors.accentInk} size={18} />
              <Text variant="label" numberOfLines={1}>
                {basket.name}
              </Text>
            </View>
            <Text variant="label">{basket.totalLabel}</Text>
          </View>
          <View style={styles.rows}>
            {basket.lines.map((line) => (
              <View key={line.id} style={styles.row}>
                <View
                  style={[styles.thumb, { backgroundColor: tintOf(line.category) }]}
                  aria-hidden
                >
                  <NativeText allowFontScaling={false} style={{ fontSize: 22, lineHeight: 28 }}>
                    {line.emoji}
                  </NativeText>
                </View>
                <View style={styles.name}>
                  <Text variant="strong" numberOfLines={1}>
                    {line.name}
                  </Text>
                  <Text variant="small" color="inkMuted" numberOfLines={1}>
                    {line.pack}
                  </Text>
                </View>
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
                <View style={styles.amount}>
                  <Text variant="strong">{line.totalLabel}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </Sheet>
  );
}
