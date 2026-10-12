import { StyleSheet, View } from 'react-native';
import { CategoryTile } from './CategoryTile';
import { Skeleton, SkeletonLine } from './Skeleton';
import { radius, space } from './tokens';

/** One tile of the grid: a picture, its colour, and its name. */
export interface CategoryGridTile {
  label: string;
  emoji: string;
  tint: string;
}

export interface CategoryTileGridProps {
  tiles: readonly CategoryGridTile[];
  /** A tile was pressed: its place in `tiles`. */
  onPress: (index: number) => void;
}

/** The room between two tiles in a row. */
const GAP = space[3];

const styles = StyleSheet.create({
  // Four equal cells to a row, by percentage: a cell's own side padding makes the gap between tiles, so a row always fits the width the
  // phone gives it, and a short last row keeps its tiles the same size.
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: space[3],
    paddingHorizontal: space[4] - GAP / 2,
  },
  cell: { width: '25%', paddingHorizontal: GAP / 2 },
  cellSkeleton: { width: '25%', paddingHorizontal: GAP / 2, gap: space[2] },
  label: { gap: 2 },
});

/** The tiles of a group or of Home's "Shop by category", four across. */
export function CategoryTileGrid({ tiles, onPress }: CategoryTileGridProps) {
  return (
    <View style={styles.grid}>
      {tiles.map((tile, index) => (
        <View key={`${tile.label}-${index}`} style={styles.cell}>
          <CategoryTile
            label={tile.label}
            emoji={tile.emoji}
            tint={tile.tint}
            onPress={() => {
              onPress(index);
            }}
          />
        </View>
      ))}
    </View>
  );
}

/** How wide each placeholder name is, as a share of the tile: some names fill two lines, some one, as the real ones do. */
const NAME_LINES = [['90%', '55%'], ['70%'], ['85%', '50%']] as const;

/**
 * The tiles while they load: squares with their one or two lines of name, in the same cells as the real grid, so nothing moves when
 * they arrive. Put it inside a `SkeletonScope`. `shift` starts the pattern of names at a different tile.
 */
export function CategoryTileGridSkeleton({ count, shift = 0 }: { count: number; shift?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, tile) => (
        <View key={tile} style={styles.cellSkeleton}>
          <Skeleton aspectRatio={1} rounded={radius.lg} />
          <View style={styles.label}>
            {(NAME_LINES[(tile + shift) % NAME_LINES.length] ?? []).map((width, line) => (
              <SkeletonLine key={line} size="xs" width={width} align="center" />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
