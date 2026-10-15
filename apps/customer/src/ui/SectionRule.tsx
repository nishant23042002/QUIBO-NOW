import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { space } from './tokens';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // One hairline, in from the screen edge to the same 16 as the content. It sits in a column that already has 32 between its
    // children, and the negative margins pull the neighbours back in by 16 each, so the line is centred in the gap: 16 above and
    // 16 below, and the gap does not grow.
    line: {
      height: 1,
      marginHorizontal: space[4],
      marginVertical: -space[4],
      backgroundColor: c.line,
    },
  });

/**
 * A plain thin line between two groups of sections on Home. It is used sparingly, only where one group ends and another begins
 * and no block of colour already divides them; the sections inside a group are divided by space alone. (`SectionDivider` is the
 * branded one, with Quibo's mark, used on the cart and the shop page.)
 */
export function SectionRule() {
  const styles = useStyles(makeStyles);
  return <View style={styles.line} aria-hidden />;
}
