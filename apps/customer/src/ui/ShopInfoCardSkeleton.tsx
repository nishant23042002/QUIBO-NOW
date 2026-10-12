import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import {
  SHOP_INFO_CARD_INSET,
  SHOP_INFO_CARD_PHOTO_RATIO,
  SHOP_INFO_CARD_TYPE_LINES,
  SHOP_INFO_CARD_WIDTH,
} from './ShopInfoCard';
import { Skeleton, SkeletonLine } from './Skeleton';
import { radius, space } from './tokens';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: SHOP_INFO_CARD_WIDTH,
      padding: SHOP_INFO_CARD_INSET,
      gap: space[2],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    text: { paddingHorizontal: space[1] },
  });

const TYPE_WIDTHS = ['92%', '60%'] as const;

/** A shop card while it loads: the same width, picture ratio, padding and lines as `ShopInfoCard`. Put it inside a `SkeletonScope`. */
export function ShopInfoCardSkeleton() {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.card}>
      <Skeleton aspectRatio={SHOP_INFO_CARD_PHOTO_RATIO} rounded={radius.md} />
      <View style={styles.text}>
        <SkeletonLine size="sm" width="70%" />
        {Array.from({ length: SHOP_INFO_CARD_TYPE_LINES }, (_, line) => (
          <SkeletonLine key={line} size="sm" width={TYPE_WIDTHS[line] ?? '60%'} />
        ))}
      </View>
    </View>
  );
}
