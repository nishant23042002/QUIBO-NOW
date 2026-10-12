import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { space } from './tokens';

export interface RowTitleProps {
  /** The title of a row or a group, already translated. */
  title: string;
}

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    // It fills the room it is given: the title, then a dotted line that carries on to the edge.
    row: {
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
    },
    title: { flexShrink: 1, minWidth: 0 },
    dots: { flex: 1, minWidth: space[6], height: 2 },
  });

/**
 * A title with a thin dotted line from it to the edge of the page: the heading of a product row on Home and of each group of
 * tiles on the Categories tab. The one place this look is drawn, so the two always match.
 */
export function RowTitle({ title }: RowTitleProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.title}>
        <Text variant="subheading" numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.dots} aria-hidden>
        <Svg width="100%" height={2}>
          <Line
            x1="1"
            y1="1"
            x2="100%"
            y2="1"
            stroke={colors.ctl}
            strokeOpacity={0.55}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="0.1 5"
          />
        </Svg>
      </View>
    </View>
  );
}
