import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonLine, SkeletonScope, radius, space } from '@/ui';

/** The place-order bar's least height, as in `CheckoutView`. */
export const CHECKOUT_DOCK = 73;

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
    row: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4] },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    grow: { flex: 1, minWidth: 0 },
    block: { gap: space[2], padding: space[4] },
    head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    option: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.line,
    },
    between: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
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
 * Grey blocks in the shape of the checkout page: when and where, the shops, the two ways to pay, the bill, and the bar with the
 * total and the button. `shops` is how many shop lines the order has, so the page does not change height when it loads, and
 * `bottom` is how far up the bar sits, above the bottom menu.
 */
export function CheckoutSkeleton({ shops, bottom }: { shops: number; bottom: number }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <View style={styles.page}>
        <View style={styles.card}>
          {[0, 1].map((index) => (
            <View key={index} style={[styles.row, index > 0 && styles.divided]}>
              <Skeleton width={40} height={40} rounded={radius.md} />
              <View style={styles.grow}>
                <SkeletonLine size="sm" width="30%" />
                <SkeletonLine size="base" width="70%" />
              </View>
              <Skeleton width={64} height={40} rounded={radius.md} />
            </View>
          ))}
        </View>
        <View style={[styles.card, styles.block]}>
          <SkeletonLine size="base" width="40%" />
          {Array.from({ length: Math.max(1, shops) }, (_, index) => (
            <View key={index} style={styles.between}>
              <SkeletonLine size="base" width="45%" />
              <SkeletonLine size="base" width={56} />
            </View>
          ))}
        </View>
        <View style={[styles.card, styles.block]}>
          <SkeletonLine size="base" width="55%" />
          {[0, 1].map((index) => (
            <View key={index} style={styles.option}>
              <Skeleton width={24} height={24} rounded={radius.full} />
              <View style={styles.grow}>
                <SkeletonLine size="base" width="50%" />
                <SkeletonLine size="sm" width="75%" />
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.card, styles.block]}>
          <View style={styles.head}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <SkeletonLine size="base" width="40%" />
          </View>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.between}>
              <SkeletonLine size="base" width="35%" />
              <SkeletonLine size="base" width={48} />
            </View>
          ))}
          <View style={styles.between}>
            <SkeletonLine size="base" width="25%" />
            <SkeletonLine size="base" width={60} />
          </View>
        </View>
      </View>
      <View style={[styles.dock, { bottom }]}>
        <View>
          <SkeletonLine size="lg" width={72} />
          <SkeletonLine size="xs" width={96} />
        </View>
        <View style={styles.grow}>
          <Skeleton height={48} rounded={radius.md} />
        </View>
      </View>
    </SkeletonScope>
  );
}
