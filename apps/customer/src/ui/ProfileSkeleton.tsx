import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Skeleton, SkeletonScope } from './Skeleton';
import { TAP_MIN, radius, space } from './tokens';

/** A choice row is as tall as in `OptionGroup`. */
const ROW = TAP_MIN + space[1];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fill: { flex: 1, overflow: 'hidden' },
    // The same gutters and gaps as `Screen`.
    content: { alignItems: 'center', paddingHorizontal: space[4], paddingTop: space[6] },
    column: { width: '100%', maxWidth: 560, gap: space[6] },
    group: { gap: space[2] },
    card: {
      overflow: 'hidden',
      borderWidth: 1,
      borderRadius: radius.lg,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    row: {
      height: ROW,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
  });

/** How wide each row's label is, so a group's rows do not all look alike. */
const LABELS = [46, 58, 38, 52] as const;

/**
 * Grey blocks in the shape of the settings screen: a short title and a card of choice rows for each group, then a full-width
 * button for each extra button. `groups` lists how many choices each group has (language, appearance, and the developer
 * switches in a development build) and `buttons` how many buttons follow, so the skeleton has the screen's own shape.
 */
export function ProfileSkeleton({
  groups,
  buttons = 0,
}: {
  groups: readonly number[];
  buttons?: number;
}) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <View style={styles.content}>
        <View style={styles.column}>
          {groups.map((rows, group) => (
            <View key={group} style={styles.group}>
              <Skeleton width={`${28 + ((group * 7) % 18)}%`} height={16} />
              <View style={styles.card}>
                {Array.from({ length: rows }, (_, row) => (
                  <View key={row} style={[styles.row, row > 0 && styles.divided]}>
                    <Skeleton
                      width={`${LABELS[(group + row) % LABELS.length] ?? 46}%`}
                      height={18}
                    />
                    <Skeleton width={20} height={20} rounded={radius.full} />
                  </View>
                ))}
              </View>
            </View>
          ))}
          {Array.from({ length: buttons }, (_, index) => (
            <Skeleton key={index} height={TAP_MIN} rounded={radius.md} />
          ))}
        </View>
      </View>
    </SkeletonScope>
  );
}
