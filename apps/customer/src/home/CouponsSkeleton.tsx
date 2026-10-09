import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonScope, radius, space } from '@/ui';
import { couponCards } from './skeletonShape';

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
    notice: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3] },
    grow: { flex: 1, gap: space[1] },
    entry: { gap: space[3], padding: space[4] },
    offer: { gap: space[3], padding: space[4] },
    offerTop: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  });

/**
 * Grey blocks in the shape of the coupons page: the sample-offers note, the box to type a code, then one card for each
 * coupon on offer (as many as there are, up to what fits the screen).
 */
export function CouponsSkeleton({ offers }: { offers: number }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <View style={styles.page}>
        <View style={[styles.card, styles.notice]}>
          <Skeleton width={20} height={20} rounded={radius.full} />
          <View style={styles.grow}>
            <Skeleton height={14} />
            <Skeleton width="70%" height={14} />
          </View>
        </View>
        <View style={[styles.card, styles.entry]}>
          <Skeleton width="30%" height={16} />
          <Skeleton height={48} rounded={radius.md} />
          <Skeleton height={48} rounded={radius.md} />
        </View>
        {Array.from({ length: couponCards(offers) }, (_, index) => (
          <View key={index} style={[styles.card, styles.offer]}>
            <View style={styles.offerTop}>
              <View style={styles.grow}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="80%" height={14} />
                <Skeleton width="45%" height={14} />
              </View>
              <Skeleton width={88} height={44} rounded={radius.md} />
            </View>
            <Skeleton width={104} height={32} rounded={radius.sm} />
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}
