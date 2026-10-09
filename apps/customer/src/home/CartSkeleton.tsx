import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonLine, SkeletonScope, radius, space } from '@/ui';
import type { CartShape } from './skeletonShape';

/**
 * The cart's picture square and the least height of one line, shared with `CartView` so nothing jumps when it loads. A line is
 * as tall as its three lines of text (name, size, shop) plus 8 above and below: 85 for English, and a line taller than
 * that for Hindi and Marathi, whose lines need more room, so the line in `CartView` grows and this is its least.
 */
export const THUMB = 56;
export const LINE_HEIGHT = 85;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fill: { flex: 1, overflow: 'hidden' },
    // The page's own gutters and gaps.
    page: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    free: { gap: space[2], padding: space[4] },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    underlined: { borderBottomWidth: 1, borderBottomColor: c.line },
    col: { flex: 1, minWidth: 0 },
    line: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[2],
    },
    side: { alignItems: 'flex-end', gap: space[1] },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingTop: space[4],
      paddingBottom: space[2],
    },
    forgot: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
    bill: { gap: space[3], padding: space[4] },
    head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // The bill's own lines: the same height and gaps as `BillSummary`.
    box: { gap: space[1] },
    billRow: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    billTotal: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      marginTop: space[2],
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    tip: { gap: space[4], padding: space[4] },
    intro: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    // The title and its lines sit 4 apart, as in the tip card.
    introText: { flex: 1, minWidth: 0, gap: space[1] },
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
      minHeight: 73,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    dockPrice: { flexShrink: 0 },
    dockButton: { flex: 1 },
  });

/** The bill's amounts and labels are of different widths, so they do not all look alike. */
const BILL_LABELS = [34, 46, 40, 42, 36] as const;

/**
 * Grey blocks in the shape of the cart page that is coming, drawn from `shape` and built from lines of text the same height as
 * the real ones, so each card is as tall as the one that replaces it and nothing moves when the page fades in: the
 * free-delivery card, the coupon card, the delivery card (when it arrives, where to, a line for each item, and the note about
 * one rider when the cart comes from more than one shop), a "saved for later" card only when something is saved, the bill (with
 * a line for a coupon and a tip when there are some, and the weighing note for loose items), the tip card and the checkout
 * bar. An empty cart gets the empty cart's picture and button instead. `bottom` is how far up the checkout bar sits, above the
 * bottom menu.
 */
export function CartSkeleton({ shape, bottom }: { shape: CartShape; bottom: number }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  if (shape.empty) {
    return (
      <SkeletonScope label={t('common.loading')} style={styles.fill}>
        <View style={styles.empty}>
          <Skeleton width={72} height={72} rounded={radius.full} />
          <SkeletonLine size="xl" tight width="55%" align="center" />
          <SkeletonLine size="base" width="80%" align="center" />
          <SkeletonLine size="base" width="60%" align="center" />
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
          <SkeletonLine size="sm" width="60%" />
        </View>
        <View style={[styles.card, styles.row]}>
          <Skeleton width={40} height={40} rounded={radius.md} />
          <View style={styles.col}>
            <SkeletonLine size="sm" width="45%" />
            <SkeletonLine size="sm" width="30%" />
          </View>
        </View>
        <View style={styles.card}>
          <View style={[styles.row, styles.underlined]}>
            <Skeleton width={40} height={40} rounded={radius.md} />
            <View style={styles.col}>
              <SkeletonLine size="sm" width="65%" />
              <SkeletonLine size="sm" width="50%" />
              <SkeletonLine size="sm" width="35%" />
            </View>
            <Skeleton width={104} height={40} rounded={radius.md} />
          </View>
          <View style={[styles.row, styles.underlined]}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <View style={styles.col}>
              <SkeletonLine size="xs" width="30%" />
              <SkeletonLine size="sm" width="75%" />
            </View>
            <Skeleton width={56} height={16} />
          </View>
          {Array.from({ length: shape.lines }, (_, index) => (
            <View key={index} style={[styles.line, index > 0 && styles.divided]}>
              <Skeleton width={THUMB} height={THUMB} rounded={radius.md} />
              <View style={styles.col}>
                <SkeletonLine size="sm" width="70%" />
                <SkeletonLine size="sm" width="45%" />
                <SkeletonLine size="xs" width="40%" />
              </View>
              <View style={styles.side}>
                <Skeleton width={84} height={32} rounded={radius.md} />
                <SkeletonLine size="sm" width={44} align="end" />
              </View>
            </View>
          ))}
          {shape.trip ? (
            <View style={[styles.row, styles.divided]}>
              <Skeleton width={18} height={18} rounded={radius.full} />
              <View style={styles.col}>
                <SkeletonLine size="sm" />
                <SkeletonLine size="sm" width="70%" />
              </View>
            </View>
          ) : null}
        </View>
        {shape.saved > 0 ? (
          <View style={styles.card}>
            <View style={styles.sectionHead}>
              <Skeleton width={20} height={20} rounded={radius.full} />
              <View style={styles.col}>
                <SkeletonLine size="lg" tight width="40%" />
              </View>
            </View>
            {Array.from({ length: shape.saved }, (_, index) => (
              <View key={index} style={[styles.row, styles.divided]}>
                <Skeleton width={44} height={44} rounded={radius.md} />
                <View style={styles.col}>
                  <SkeletonLine size="sm" width="60%" />
                  <SkeletonLine size="sm" width="40%" />
                </View>
                <Skeleton width={96} height={36} rounded={radius.md} />
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.forgot}>
          <Skeleton width="55%" height={14} />
        </View>
        <View style={[styles.card, styles.bill]}>
          <View style={styles.head}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <View style={styles.col}>
              <SkeletonLine size="lg" tight width="38%" />
            </View>
          </View>
          <View style={styles.box}>
            {Array.from({ length: shape.billRows }, (_, index) => (
              <View key={index} style={styles.billRow}>
                <View style={styles.col}>
                  <SkeletonLine
                    size="base"
                    width={`${BILL_LABELS[index % BILL_LABELS.length] ?? 40}%`}
                  />
                </View>
                <SkeletonLine size="base" width={48} align="end" />
              </View>
            ))}
            <View style={styles.billTotal}>
              <SkeletonLine size="xl" tight width={96} />
              <SkeletonLine size="xl" tight width={72} align="end" />
            </View>
          </View>
          <Skeleton height={40} rounded={radius.md} />
          {shape.weighed ? (
            <View>
              <SkeletonLine size="sm" />
              <SkeletonLine size="sm" />
              <SkeletonLine size="sm" width="60%" />
            </View>
          ) : null}
          <View>
            <SkeletonLine size="sm" />
            <SkeletonLine size="sm" width="45%" />
          </View>
        </View>
        <View style={[styles.card, styles.tip]}>
          <Skeleton height={48} rounded={radius.full} />
          <View style={styles.intro}>
            <View style={styles.introText}>
              <SkeletonLine size="base" width="40%" />
              <SkeletonLine size="sm" />
              <SkeletonLine size="sm" />
              <SkeletonLine size="sm" width="60%" />
            </View>
            <Skeleton width={56} height={56} rounded={radius.lg} />
          </View>
          <View style={styles.chips}>
            {[64, 64, 64, 80].map((width, index) => (
              <Skeleton key={index} width={width} height={36} rounded={radius.full} />
            ))}
          </View>
        </View>
      </View>
      <View style={[styles.dock, { bottom }]}>
        <View style={styles.dockPrice}>
          <SkeletonLine size="lg" tight width={72} />
          <SkeletonLine size="xs" width={56} />
        </View>
        <View style={styles.dockButton}>
          <Skeleton height={48} rounded={radius.md} />
        </View>
      </View>
    </SkeletonScope>
  );
}
