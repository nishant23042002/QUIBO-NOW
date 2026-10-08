import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { space } from './tokens';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingHorizontal: space[4] },
    line: { flex: 1, height: 1, backgroundColor: c.line },
  });

/**
 * The break between two sections of the page: a fine line on each side of Quibo's own mark, the two slanted
 * speed lines from the logo. Decorative, so it is hidden from screen readers.
 */
export function SectionDivider() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.row} aria-hidden>
      <View style={styles.line} />
      <Svg width={30} height={16} viewBox="0 0 30 16">
        <Path d="M11 0H17L10 16H4Z" fill={colors.accentEdge} />
        <Path d="M21 0H25L18 16H14Z" fill={colors.accentEdge} opacity={0.55} />
      </Svg>
      <View style={styles.line} />
    </View>
  );
}
