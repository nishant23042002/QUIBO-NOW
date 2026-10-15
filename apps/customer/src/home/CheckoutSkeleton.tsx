import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonLine, SkeletonScope, fontSize, radius, space, textLines } from '@/ui';
import { BillCardSkeleton } from './CartSkeleton';

/** The place-order bar's least height, as in `CheckoutView`. */
export const CHECKOUT_DOCK = 73;

/** One shop of the order, with the names of what it sells in it, in the cart's order. */
export interface CheckoutSkeletonShop {
  name: string;
  items: readonly string[];
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fill: { flex: 1, overflow: 'hidden' },
    // The page's own gutters and gaps, as in `CheckoutView`.
    page: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    block: { gap: space[3], padding: space[4] },
    head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    rowText: { flex: 1, minWidth: 0 },
    shop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      minHeight: 32,
    },
    groups: { gap: space[4] },
    group: { gap: space[3] },
    line: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    lineText: { flex: 1, minWidth: 0 },
    options: { gap: space[2] },
    option: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: 'transparent',
    },
    optionText: { flex: 1, minWidth: 0 },
    grow: { flex: 1, minWidth: 0 },
    dock: {
      position: 'absolute',
      left: 0,
      right: 0,
      minHeight: CHECKOUT_DOCK,
      paddingVertical: space[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
  });

/**
 * Grey blocks in the checkout page's own layout, from what the order is: when it arrives (with the line under it for a quick
 * delivery) and where it goes (its address taking the lines it wraps to), each shop with a line for each thing in it (a name
 * that wraps takes two), the line about one trip for more than one shop, the two ways to pay, the bill, and the bar with the
 * total and the button. The same cards, rows and gaps as the page, so each lands where its real one will. `bottom` is how far up
 * the bar sits, above the bottom menu.
 */
export function CheckoutSkeleton({
  quick,
  address,
  shops,
  billRows,
  weighed,
  bottom,
}: {
  /** Quick delivery has an estimate line under its headline. */
  quick: boolean;
  /** Where the order goes, as the page shows it. */
  address: string;
  shops: readonly CheckoutSkeletonShop[];
  /** How many lines the bill has before its total. */
  billRows: number;
  weighed: boolean;
  bottom: number;
}) {
  const { t, locale } = useLanguage();
  const styles = useStyles(makeStyles);
  const { width: screen } = useWindowDimensions();
  const script = locale === 'en' ? 'latin' : 'devanagari';
  // Inside a card: the page's gutters, the card's border and its padding.
  const cardInner = screen - space[3] * 2 - 2 - space[4] * 2;
  // The address sits beside its pin (40), the gaps, and the Change link (about 64).
  const addressWidth = cardInner - 40 - 64 - space[3] * 2;
  const addressLines = Math.min(2, textLines(address, addressWidth, fontSize.sm, script));
  // A thing in the order sits beside its picture (44) and its price (about 64).
  const nameWidth = cardInner - 44 - 64 - space[3] * 2;
  const trip = shops.length > 1;

  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Skeleton width={40} height={40} rounded={radius.md} />
            <View style={styles.rowText}>
              <SkeletonLine size="sm" width="64%" />
              {quick ? <SkeletonLine size="sm" width="48%" /> : null}
            </View>
            <Skeleton width={56} height={40} rounded={radius.md} />
          </View>
          <View style={[styles.row, styles.divided]}>
            <Skeleton width={40} height={40} rounded={radius.md} />
            <View style={styles.rowText}>
              <SkeletonLine size="xs" width="40%" />
              {Array.from({ length: addressLines }, (_, line) => (
                <SkeletonLine
                  key={line}
                  size="sm"
                  width={line === addressLines - 1 && addressLines > 1 ? '60%' : '92%'}
                />
              ))}
            </View>
            <Skeleton width={56} height={40} rounded={radius.md} />
          </View>
        </View>

        <View style={[styles.card, styles.block]}>
          <View style={styles.head}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <SkeletonLine size="lg" tight width="38%" />
          </View>
          <View style={styles.groups}>
            {shops.map((shop) => (
              <View key={shop.name} style={styles.group}>
                <View style={styles.shop}>
                  <SkeletonLine size="sm" width={120} />
                  <SkeletonLine size="sm" width={56} />
                </View>
                {shop.items.map((name, index) => {
                  const nameLines = Math.min(2, textLines(name, nameWidth, fontSize.base, script));
                  return (
                    <View key={`${name}-${index}`} style={styles.line}>
                      <Skeleton width={44} height={44} rounded={radius.md} />
                      <View style={styles.lineText}>
                        <View>
                          {Array.from({ length: nameLines }, (_, line) => (
                            <SkeletonLine
                              key={line}
                              size="base"
                              width={line === nameLines - 1 && nameLines > 1 ? '55%' : '86%'}
                            />
                          ))}
                        </View>
                        <SkeletonLine size="xs" width="34%" />
                      </View>
                      <Skeleton width={52} height={Math.round(fontSize.sm * 0.8)} />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          {trip ? (
            <View>
              {Array.from(
                {
                  length: textLines(
                    t('cart.oneTrip', { count: shops.length }),
                    cardInner,
                    fontSize.sm,
                    script,
                  ),
                },
                (_, line) => (
                  <SkeletonLine key={line} size="sm" width={line === 0 ? '100%' : '60%'} />
                ),
              )}
            </View>
          ) : null}
        </View>

        <View style={[styles.card, styles.block]}>
          <SkeletonLine size="lg" tight width="52%" />
          <View style={styles.options}>
            {[0, 1].map((index) => (
              <View key={index} style={styles.option}>
                <Skeleton width={24} height={24} rounded={radius.full} />
                <View style={styles.optionText}>
                  <SkeletonLine size="sm" width={index === 0 ? '46%' : '58%'} />
                  <SkeletonLine size="sm" width="78%" />
                </View>
              </View>
            ))}
          </View>
        </View>

        <BillCardSkeleton rows={billRows} weighed={weighed} />
      </View>
      <View style={[styles.dock, { bottom }]}>
        <View>
          <SkeletonLine size="lg" tight width={72} />
          <SkeletonLine size="xs" width={96} />
        </View>
        <View style={styles.grow}>
          <Skeleton height={48} rounded={radius.md} />
        </View>
      </View>
    </SkeletonScope>
  );
}
