import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonScope, radius, space } from '@/ui';

const SHOP_CARD = 168;
const ITEM_CARD = 144;

const styles = StyleSheet.create({
  page: { gap: space[6], paddingVertical: space[5] },
  section: { gap: space[3] },
  title: { paddingHorizontal: space[4] },
  row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  card: { gap: space[2] },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[5],
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

/** A shop card while shops load: the picture, then a name and a line of detail. */
function ShopCardSkeleton() {
  return (
    <View style={[styles.card, { width: SHOP_CARD }]}>
      <Skeleton height={106} rounded={radius.lg} />
      <Skeleton width="70%" height={16} />
      <Skeleton width="45%" height={14} />
    </View>
  );
}

/** An item card while items load: the picture, a name, a pack size and the price with its button. */
function ItemCardSkeleton({ width = ITEM_CARD }: { width?: number | `${number}%` }) {
  return (
    <View style={[styles.card, { width }]}>
      <Skeleton height={width === ITEM_CARD ? ITEM_CARD : 150} rounded={radius.lg} />
      <Skeleton width="85%" height={16} />
      <Skeleton width="40%" height={14} />
      <View style={styles.priceRow}>
        <Skeleton width={52} height={20} />
        <Skeleton width={56} height={32} rounded={radius.full} />
      </View>
    </View>
  );
}

function Rail({ title, children }: { title: number; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.title}>
        <Skeleton width={title} height={20} />
      </View>
      <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>{children}</View>
      </ScrollView>
    </View>
  );
}

/**
 * What Home shows while its shops and items load: a row of shop cards and three rows of item cards,
 * as grey blocks in the same shapes the real cards will have. Replaced by the real rails in Phase 1b.
 */
export function HomeSkeleton({ label, grid = false }: { label: string; grid?: boolean }) {
  if (grid) {
    return (
      <SkeletonScope label={label}>
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((key) => (
            <ItemCardSkeleton key={key} width="47%" />
          ))}
        </View>
      </SkeletonScope>
    );
  }

  return (
    <SkeletonScope label={label}>
      <View style={styles.page}>
        <Rail title={120}>
          <ShopCardSkeleton />
          <ShopCardSkeleton />
          <ShopCardSkeleton />
        </Rail>
        {[160, 140, 180].map((title) => (
          <Rail key={title} title={title}>
            <ItemCardSkeleton />
            <ItemCardSkeleton />
            <ItemCardSkeleton />
          </Rail>
        ))}
      </View>
    </SkeletonScope>
  );
}
