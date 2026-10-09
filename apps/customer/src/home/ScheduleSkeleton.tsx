import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonLine, SkeletonScope, radius, space } from '@/ui';

/** The confirm bar's least height, as in `ScheduleView`. */
const DOCK = 124;
const THUMB = 36;
const CHIPS_PER_ROW = 3;
const CHIP_ROWS = 2;
const GROUPS = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fill: { flex: 1, overflow: 'hidden' },
    // The page's own gutters and gaps, as in `ScheduleView`.
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
    grow: { flex: 1, minWidth: 0 },
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
    optionRow: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    optionText: { flex: 1, minWidth: 0, gap: space[1] },
    note: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], padding: space[4] },
    noteText: { flex: 1, minWidth: 0, gap: space[1] },
    hint: { paddingHorizontal: space[4], paddingTop: space[3] },
    picker: { paddingHorizontal: space[4], paddingBottom: space[4] },
    days: { flexDirection: 'row', minHeight: 57, borderBottomWidth: 1, borderBottomColor: c.line },
    day: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 0 },
    body: { gap: space[4], paddingTop: space[4] },
    group: { gap: space[2] },
    groupHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    chip: { flexGrow: 1, flexBasis: '30%' },
    dock: {
      position: 'absolute',
      left: 0,
      right: 0,
      minHeight: DOCK,
      paddingVertical: space[3],
      gap: space[2],
      justifyContent: 'center',
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
  });

/**
 * Grey blocks in the shape of the delivery-time page, built from lines of text the same height as the real ones so that each card
 * is as tall as the one that replaces it: the strip of what is being delivered (only when the cart has something), the two
 * choices, then what the chosen one shows: the quick-delivery note (with the delivery fee line unless delivery is free), or the
 * days and the windows to pick from. `mode` is what is chosen now, so the page does not change shape when it loads. `bottom` is
 * how far up the confirm bar sits, above the bottom menu.
 */
export function ScheduleSkeleton({
  items,
  mode,
  fee = true,
  bottom,
}: {
  items: boolean;
  mode: 'quick' | 'slot';
  /** Quick delivery has a line saying what delivery costs, unless it is free. */
  fee?: boolean;
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
              <SkeletonLine size="sm" width="35%" />
            </View>
            <Skeleton width={72} height={16} />
          </View>
        ) : null}
        <View style={styles.options}>
          {[0, 1].map((index) => (
            <View key={index} style={styles.option}>
              <View style={styles.optionRow}>
                <View style={styles.optionText}>
                  {/* The title takes two lines and the line under it one or two: each is one text, so no gap inside. */}
                  <View>
                    <SkeletonLine size="base" width="70%" />
                    <SkeletonLine size="base" width="50%" />
                  </View>
                  <View>
                    <SkeletonLine size="sm" width="60%" />
                    {/* The picked window ("Tomorrow, 5–6 PM") takes two lines under the Schedule choice. */}
                    {index === 1 && mode === 'slot' ? <SkeletonLine size="sm" width="40%" /> : null}
                  </View>
                </View>
                <Skeleton width={36} height={36} rounded={radius.md} />
              </View>
            </View>
          ))}
        </View>
        {mode === 'quick' ? (
          <View style={[styles.card, styles.note]}>
            <Skeleton width={20} height={20} rounded={radius.full} />
            <View style={styles.noteText}>
              <View>
                <SkeletonLine size="sm" />
                <SkeletonLine size="sm" width="85%" />
                <SkeletonLine size="sm" width="40%" />
              </View>
              {fee ? <SkeletonLine size="sm" width="35%" /> : null}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.hint}>
              <SkeletonLine size="sm" width="70%" />
            </View>
            <View style={styles.picker}>
              <View style={styles.days}>
                {[0, 1].map((index) => (
                  <View key={index} style={styles.day}>
                    <SkeletonLine size="base" width={64} align="center" />
                    <SkeletonLine size="xs" width={92} align="center" />
                  </View>
                ))}
              </View>
              <View style={styles.body}>
                {Array.from({ length: GROUPS }, (_, group) => (
                  <View key={group} style={styles.group}>
                    <View style={styles.groupHead}>
                      <Skeleton width={16} height={16} rounded={radius.full} />
                      <SkeletonLine size="xs" width={72} />
                    </View>
                    <View style={styles.chips}>
                      {Array.from({ length: CHIPS_PER_ROW * CHIP_ROWS }, (_, chip) => (
                        <View key={chip} style={styles.chip}>
                          <Skeleton height={56} rounded={radius.md} />
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
      <View style={[styles.dock, { bottom }]}>
        <SkeletonLine size="sm" width="90%" align="center" />
        <SkeletonLine size="sm" width="55%" align="center" />
        <Skeleton height={48} rounded={radius.md} />
      </View>
    </SkeletonScope>
  );
}
