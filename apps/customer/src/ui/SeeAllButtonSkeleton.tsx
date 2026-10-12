import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { TAP_MIN, radius, space } from './tokens';

const styles = StyleSheet.create({
  slot: { marginHorizontal: space[4], minHeight: TAP_MIN },
});

/** The "See all" button's place while a row loads: the same width, height and rounding, so the next row starts where it will. */
export function SeeAllButtonSkeleton() {
  return (
    <View style={styles.slot}>
      <Skeleton height={TAP_MIN} rounded={radius.lg} />
    </View>
  );
}
