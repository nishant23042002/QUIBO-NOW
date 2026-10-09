import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonScope, radius, space } from '@/ui';

/** The confirm bar's least height, as in `ScheduleView`. */
const DOCK = 124;
const THUMB = 36;
const CHIPS_PER_ROW = 3;

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
    order: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4] },
    thumbs: { flexDirection: 'row' },
    grow: { flex: 1, gap: space[1] },
    options: { flexDirection: 'row', gap: space[3] },
    option: {
      flex: 1,
      minHeight: 88,
      padding: space[3],
      borderWidth: 1.5,
      borderRadius: radius.lg,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    optionRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    note: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], padding: space[4] },
    picker: { gap: space[4], padding: space[4] },
    days: { flexDirection: 'row', gap: space[3] },
    group: { gap: space[2] },
    chips: { flexDirection: 'row', gap: space[2] },
    dock: {
      position: 'absolute',
      left: 0,
      right: 0,
      minHeight: DOCK,
      paddingVertical: space[3],
      gap: space[2],
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
  });

/**
 * Grey blocks in the shape of the delivery-time page: the strip of what is being delivered (only when the cart has
 * something), the two choices, then what the chosen one shows: the quick-delivery note, or the days and the windows to pick
 * from. `mode` is what is chosen now, so the page does not change shape when it loads. `bottom` is how far up the confirm
 * bar sits, above the bottom menu.
 */
export function ScheduleSkeleton({
  items,
  mode,
  bottom,
}: {
  items: boolean;
  mode: 'quick' | 'slot';
  bottom: number;
}) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <View style={styles.page}>
        {items ? (
          <View style={[styles.card, styles.order]}>
            <View style={styles.thumbs}>
              {[0, 1, 2].map((index) => (
                <View key={index} style={{ marginLeft: index === 0 ? 0 : -space[2] }}>
                  <Skeleton width={THUMB} height={THUMB} rounded={radius.full} />
                </View>
              ))}
            </View>
            <View style={styles.grow}>
              <Skeleton width="35%" height={16} />
            </View>
            <Skeleton width={72} height={16} />
          </View>
        ) : null}
        <View style={styles.options}>
          {[0, 1].map((index) => (
            <View key={index} style={styles.option}>
              <View style={styles.optionRow}>
                <View style={styles.grow}>
                  <Skeleton width="70%" height={18} />
                  <Skeleton width="50%" height={14} />
                </View>
                <Skeleton width={36} height={36} rounded={radius.md} />
              </View>
            </View>
          ))}
        </View>
        {mode === 'quick' ? (
          <View style={[styles.card, styles.note]}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <View style={styles.grow}>
              <Skeleton height={14} />
              <Skeleton width="85%" height={14} />
              <Skeleton width="40%" height={16} />
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.picker]}>
            <View style={styles.days}>
              <View style={styles.grow}>
                <Skeleton height={56} rounded={radius.md} />
              </View>
              <View style={styles.grow}>
                <Skeleton height={56} rounded={radius.md} />
              </View>
            </View>
            {[0, 1].map((group) => (
              <View key={group} style={styles.group}>
                <Skeleton width={96} height={14} />
                <View style={styles.chips}>
                  {Array.from({ length: CHIPS_PER_ROW }, (_, chip) => (
                    <View key={chip} style={styles.grow}>
                      <Skeleton height={56} rounded={radius.md} />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={[styles.dock, { bottom }]}>
        <Skeleton width="62%" height={14} />
        <Skeleton height={48} rounded={radius.md} />
      </View>
    </SkeletonScope>
  );
}
