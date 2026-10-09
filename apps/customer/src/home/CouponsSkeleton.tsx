import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonLine, SkeletonScope, radius, space } from '@/ui';
import { couponCards } from './skeletonShape';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fill: { flex: 1, overflow: 'hidden' },
    // The page's own gutters and gaps, as in `CouponsView`.
    page: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    // The note about sample offers is a banner: smaller corners and a heavier line, as in `Notice`.
    notice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: c.line,
    },
    grow: { flex: 1, minWidth: 0 },
    entry: { gap: space[3], padding: space[4] },
    field: { gap: space[2] },
    offer: { gap: space[3], padding: space[4] },
    offerTop: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    offerText: { flex: 1, minWidth: 0, gap: space[1] },
  });

/** The code box under each offer: a label's line plus its padding and dashed edge. */
const CODE_HEIGHT = 37;

/**
 * Grey blocks in the shape of the coupons page, built from lines of text the same height as the real ones so that each card is as
 * tall as the one that replaces it: the sample-offers note, the box to type a code, then one card for each coupon on offer (as
 * many as there are, up to what fits the screen).
 */
export function CouponsSkeleton({ offers }: { offers: number }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <View style={styles.page}>
        <View style={styles.notice}>
          <Skeleton width={20} height={20} rounded={radius.full} />
          <View style={styles.grow}>
            <SkeletonLine size="sm" />
            <SkeletonLine size="sm" width="70%" />
          </View>
        </View>
        <View style={[styles.card, styles.entry]}>
          <View style={styles.field}>
            <SkeletonLine size="base" width="30%" />
            <Skeleton height={48} rounded={radius.md} />
          </View>
          <Skeleton height={48} rounded={radius.md} />
        </View>
        {Array.from({ length: couponCards(offers) }, (_, index) => (
          <View key={index} style={[styles.card, styles.offer]}>
            <View style={styles.offerTop}>
              <View style={styles.offerText}>
                <SkeletonLine size="sm" width="60%" />
                <SkeletonLine size="sm" width="80%" />
                <SkeletonLine size="xs" width="45%" />
              </View>
              <Skeleton width={88} height={44} rounded={radius.md} />
            </View>
            <Skeleton width={104} height={CODE_HEIGHT} rounded={radius.sm} />
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}
