import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { RowTitle } from './RowTitle';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';

export interface ProductRailProps {
  title: string;
  /** The text of the button under the row, for example "See all". Leave it and `onSeeAll` out for a row with nowhere to go. */
  seeAllLabel?: string;
  onSeeAll?: () => void;
  /** The cards. They sit in one row that swipes sideways. */
  children: ReactNode;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    rail: { gap: space[3] },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    // Under the row, the width of the page: the way into the whole category.
    more: {
      marginHorizontal: space[4],
      minHeight: TAP_MIN,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      borderWidth: 1.5,
      borderRadius: radius.lg,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    pressed: { backgroundColor: c.muted },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * A titled row of items with a dotted line from its title to the page's edge and a "See all" button under the row. The title is part
 * of the page and scrolls away with its row, so nothing is left lying over the items.
 */
export function ProductRail({ title, seeAllLabel, onSeeAll, children }: ProductRailProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.rail}>
      <View style={styles.head}>
        <RowTitle title={title} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>{children}</View>
      </ScrollView>
      {seeAllLabel !== undefined && onSeeAll !== undefined ? (
        <Pressable
          role="button"
          aria-label={`${seeAllLabel}: ${title}`}
          onPress={onSeeAll}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <Text variant="strong">{seeAllLabel}</Text>
          <Icon name="chevronRight" color={colors.ink} size={16} />
        </Pressable>
      ) : null}
    </View>
  );
}
