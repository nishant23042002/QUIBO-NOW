import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonScope, radius, space } from '@/ui';

/** The cart's picture square and the height of one line, shared with `CartView` so nothing jumps when it loads. */
export const THUMB = 56;
export const LINE_HEIGHT = 80;

const LINES = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
    name: { flex: 1, gap: space[1] },
    side: { alignItems: 'flex-end', gap: space[1] },
  });

/** Grey blocks in the shape of the cart page: the free-delivery card, then the list of items. */
export function CartSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')}>
      <View style={styles.page}>
        <View style={[styles.card, styles.free]}>
          <Skeleton height={4} rounded={radius.full} />
          <Skeleton width="60%" height={16} />
        </View>
        <View style={styles.card}>
          <View style={styles.arrive}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <View style={styles.arriveText}>
              <Skeleton width="65%" height={16} />
              <Skeleton width="80%" height={14} />
            </View>
            <Skeleton width={72} height={36} rounded={radius.md} />
          </View>
          {Array.from({ length: LINES }, (_, index) => (
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
        </View>
      </View>
    </SkeletonScope>
  );
}
