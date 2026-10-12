import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { RowTitle } from './RowTitle';
import { SeeAllButton } from './SeeAllButton';
import { space } from './tokens';

export interface ProductRailProps {
  title: string;
  /** The text of the button under the row, for example "See all". Leave it and `onSeeAll` out for a row with nowhere to go. */
  seeAllLabel?: string;
  onSeeAll?: () => void;
  /** The cards. They sit in one row that swipes sideways. */
  children: ReactNode;
}

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    rail: { gap: space[3] },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * A titled row of items with a dotted line from its title to the page's edge and a "See all" button under the row. The title is part
 * of the page and scrolls away with its row, so nothing is left lying over the items.
 */
export function ProductRail({ title, seeAllLabel, onSeeAll, children }: ProductRailProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.rail}>
      <View style={styles.head}>
        <RowTitle title={title} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>{children}</View>
      </ScrollView>
      {seeAllLabel !== undefined && onSeeAll !== undefined ? (
        <SeeAllButton label={seeAllLabel} title={title} onPress={onSeeAll} />
      ) : null}
    </View>
  );
}
