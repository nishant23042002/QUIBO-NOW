import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonScope, radius, space } from '@/ui';
import type { CartShape } from './skeletonShape';

/**
 * The cart's picture square and the height of one line, shared with `CartView` so nothing jumps when it loads. A line is
 * as tall as its three lines of text (name, size, shop) plus 8 above and below: 85 for English, and a line taller than
 * that for Hindi and Marathi, whose lines need more room, so the line in `CartView` grows and this is its least.
 */
export const THUMB = 56;
export const LINE_HEIGHT = 85;

/** One row of "saved for later": its picture and two lines of text. */
const SAVED_ROW = 76;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fill: { flex: 1, overflow: 'hidden' },
    page: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    free: { gap: space[2], padding: space[4] },
    line: {
      height: LINE_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    arrive: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    arriveText: { flex: 1, gap: space[1] },
    address: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    coupon: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    name: { flex: 1, gap: space[1] },
    side: { alignItems: 'flex-end', gap: space[1] },
    trip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingTop: space[4],
      paddingBottom: space[2],
    },
    savedRow: {
      height: SAVED_ROW,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    forgot: { alignItems: 'center', paddingVertical: space[1] },
    bill: { gap: space[3], padding: space[4] },
    billHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    billRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    billTotal: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    tip: { gap: space[4], padding: space[4] },
    chips: { flexDirection: 'row', gap: space[2] },
    empty: {
      alignItems: 'center',
      gap: space[3],
      paddingTop: space[16],
      paddingHorizontal: space[6],
    },
    dock: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    dockPrice: { gap: space[1] },
    dockButton: { flex: 1 },
  });

/**
 * Grey blocks in the shape of the cart page that is coming, drawn from `shape`: one line for each item in the cart (up
 * to what fits the screen), the note about one rider when it comes from more than one shop, a "saved for later" card only
 * when something is saved, then the bill, the tip card and the checkout bar. An empty cart gets the empty cart's picture
 * and button instead. `bottom` is how far up the checkout bar sits, above the bottom menu.
 */
export function CartSkeleton({ shape, bottom }: { shape: CartShape; bottom: number }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  if (shape.empty) {
    return (
      <SkeletonScope label={t('common.loading')} style={styles.fill}>
        <View style={styles.empty}>
          <Skeleton width={72} height={72} rounded={radius.full} />
          <Skeleton width="55%" height={24} />
          <Skeleton width="80%" height={16} />
          <Skeleton width="60%" height={16} />
          <Skeleton width={160} height={48} rounded={radius.md} />
        </View>
      </SkeletonScope>
    );
  }

  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <View style={styles.page}>
        <View style={[styles.card, styles.free]}>
          <Skeleton height={4} rounded={radius.full} />
          <Skeleton width="60%" height={16} />
        </View>
        <View style={[styles.card, styles.coupon]}>
          <Skeleton width={40} height={40} rounded={radius.md} />
          <View style={styles.arriveText}>
            <Skeleton width="45%" height={16} />
            <Skeleton width="30%" height={14} />
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.arrive}>
            <Skeleton width={40} height={40} rounded={radius.md} />
            <View style={styles.arriveText}>
              <Skeleton width="65%" height={16} />
              <Skeleton width="80%" height={14} />
            </View>
            <Skeleton width={104} height={36} rounded={radius.md} />
          </View>
          <View style={styles.address}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <View style={styles.arriveText}>
              <Skeleton width="30%" height={14} />
              <Skeleton width="75%" height={16} />
            </View>
            <Skeleton width={56} height={16} />
          </View>
          {Array.from({ length: shape.lines }, (_, index) => (
            <View key={index} style={[styles.line, index > 0 && styles.divided]}>
              <Skeleton width={THUMB} height={THUMB} rounded={radius.md} />
              <View style={styles.name}>
                <Skeleton width="70%" height={16} />
                <Skeleton width="45%" height={14} />
              </View>
              <View style={styles.side}>
                <Skeleton width={84} height={32} rounded={radius.md} />
                <Skeleton width={44} height={16} />
              </View>
            </View>
          ))}
          {shape.trip ? (
            <View style={styles.trip}>
              <Skeleton width={18} height={18} rounded={radius.full} />
              <View style={styles.arriveText}>
                <Skeleton width="90%" height={14} />
              </View>
            </View>
          ) : null}
        </View>
        {shape.saved > 0 ? (
          <View style={styles.card}>
            <View style={styles.sectionHead}>
              <Skeleton width={20} height={20} rounded={radius.full} />
              <Skeleton width="40%" height={18} />
            </View>
            {Array.from({ length: shape.saved }, (_, index) => (
              <View key={index} style={styles.savedRow}>
                <Skeleton width={44} height={44} rounded={radius.md} />
                <View style={styles.name}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={14} />
                </View>
                <Skeleton width={96} height={32} rounded={radius.md} />
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.forgot}>
          <Skeleton width="55%" height={14} />
        </View>
        <View style={[styles.card, styles.bill]}>
          <View style={styles.billHead}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <Skeleton width="38%" height={20} />
          </View>
          {[48, 62, 54].map((label, index) => (
            <View key={index} style={styles.billRow}>
              <Skeleton width={`${label}%`} height={16} />
              <Skeleton width={44} height={16} />
            </View>
          ))}
          <View style={styles.billTotal}>
            <Skeleton width="30%" height={22} />
            <Skeleton width={64} height={22} />
          </View>
          <Skeleton height={36} rounded={radius.md} />
        </View>
        <View style={[styles.card, styles.tip]}>
          <Skeleton height={40} rounded={radius.full} />
          <Skeleton width="40%" height={18} />
          <View style={styles.chips}>
            {[64, 64, 64, 80].map((width, index) => (
              <Skeleton key={index} width={width} height={36} rounded={radius.full} />
            ))}
          </View>
        </View>
      </View>
      <View style={[styles.dock, { bottom }]}>
        <View style={styles.dockPrice}>
          <Skeleton width={72} height={22} />
          <Skeleton width={56} height={14} />
        </View>
        <View style={styles.dockButton}>
          <Skeleton height={48} rounded={radius.md} />
        </View>
      </View>
    </SkeletonScope>
  );
}
