import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonLine } from './Skeleton';
import { radius, space } from './tokens';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  dots: { flex: 1, minWidth: space[6] },
});

/** About how wide a letter of a row title is, for sizing the grey bar that stands in for it. */
const LETTER = 10;
/** The most of the row a title bar takes, so its dotted line always has room. */
const MAX_WIDTH = 220;

/**
 * A row title while it loads: a bar as long as the real title is (from its letters), at the title's own height, and the thin dotted
 * line that carries on from it to the edge, as `RowTitle` draws. Put it inside a `SkeletonScope`, in the same padded wrapper the real
 * title has.
 */
export function RowTitleSkeleton({ title }: { title: string }) {
  const width = Math.min(MAX_WIDTH, Math.max(72, [...title].length * LETTER));
  return (
    <View style={styles.row}>
      <View style={{ width }}>
        <SkeletonLine size="lg" tight />
      </View>
      <View style={styles.dots}>
        <Skeleton height={2} rounded={radius.full} />
      </View>
    </View>
  );
}
