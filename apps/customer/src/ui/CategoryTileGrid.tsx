import { StyleSheet, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { CategoryTile } from './CategoryTile';
import { Skeleton, SkeletonLine } from './Skeleton';
import { TILE_LETTER_WIDTH, tileNameLines } from './logic/tileNames';
import { radius, space } from './tokens';

/** One tile of the grid: a picture, its colour, and its name. */
export interface CategoryGridTile {
  label: string;
  emoji: string;
  tint: string;
  /** The picture, when there is one; the emoji stands in until then. */
  picture?: ImageSourcePropType;
  /** A small word on the picture ("Soon", "Tomorrow"), already translated. */
  tag?: string;
  /** A tile for something that is not here yet: softened. It can still be pressed, to say when it is coming. */
  soon?: boolean;
  /** Twice as wide, showing `emojis` side by side. Used for the first tile of a group. */
  wide?: boolean;
  emojis?: readonly string[];
  /** The shopper asked to be told when this arrives: the tile turns pistachio. */
  notified?: boolean;
  /** What a screen reader says besides the name, for example that a tap turns Notify me on. */
  hint?: string;
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
  cellWide: { width: '50%', paddingHorizontal: GAP / 2 },
  cellSkeleton: { width: '25%', paddingHorizontal: GAP / 2, gap: space[2] },
});

/** The tiles of a group on Home or in the Categories tab, four across (a wide tile takes two). */
export function CategoryTileGrid({ tiles, onPress }: CategoryTileGridProps) {
  return (
    <View style={styles.grid}>
      {tiles.map((tile, index) => (
        <View
          key={`${tile.label}-${index}`}
          style={tile.wide === true ? styles.cellWide : styles.cell}
        >
          <CategoryTile
            label={tile.label}
            emoji={tile.emoji}
            tint={tile.tint}
            {...(tile.picture !== undefined ? { picture: tile.picture } : {})}
            {...(tile.tag !== undefined ? { tag: tile.tag } : {})}
            {...(tile.emojis !== undefined ? { emojis: tile.emojis } : {})}
            {...(tile.hint !== undefined ? { hint: tile.hint } : {})}
            wide={tile.wide === true}
            notified={tile.notified === true}
            dimmed={tile.soon === true}
            onPress={() => {
              onPress(index);
            }}
          />
        </View>
      ))}
    </View>
  );
}

/** The widths of the placeholder names when the real ones are not known: some fill two lines, some one. */
const NAME_LINES = [['90%', '55%'], ['70%'], ['85%', '50%']] as const;

/**
 * The tiles while they load: squares with their one or two lines of name, in the same cells as the real grid, so nothing moves when
 * they arrive. Put it inside a `SkeletonScope`. Give `names` (the real names, in order) and each tile draws the lines its own name
 * will take; without them a pattern of names stands in, starting at tile `shift`.
 */
export function CategoryTileGridSkeleton({
  count,
  shift = 0,
  names,
}: {
  count: number;
  shift?: number;
  names?: readonly string[];
}) {
  const { width: screen } = useWindowDimensions();
  // A tile's name has the cell's width less the gap, and the letters that fit in it decide where a name breaks.
  const cell = (screen - 2 * (space[4] - GAP / 2)) / 4 - GAP;
  const perLine = Math.max(6, Math.floor(cell / TILE_LETTER_WIDTH));
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, tile) => {
        const known = names?.[tile];
        const widths: readonly `${number}%`[] =
          known !== undefined
            ? tileNameLines(known, perLine).map((share) => `${Math.round(share * 100)}%` as const)
            : (NAME_LINES[(tile + shift) % NAME_LINES.length] ?? []);
        return (
          <View key={tile} style={styles.cellSkeleton}>
            <Skeleton aspectRatio={1} rounded={radius.lg} />
            <View>
              {widths.map((width, line) => (
                <SkeletonLine key={line} size="xs" width={width} align="center" />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}
