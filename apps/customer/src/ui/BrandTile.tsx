import { Pressable, StyleSheet } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { BrandMark } from './BrandMark';
import { Text } from './Text';
import { space } from './tokens';

export interface BrandTileProps {
  /** The brand's id, which picks its logo (ADR 0040). */
  brandId: string;
  /** The letter drawn on the tile when the brand has no logo yet (ADR 0036). */
  mark: string;
  /** The brand's name, in the shopper's language. */
  name: string;
  /** What a screen reader says, for example "Amul. Explore all products". */
  label: string;
  onPress: () => void;
}

/** How wide a brand tile is, so a row of them keeps its rhythm and the loading skeleton can draw the same. */
export const BRAND_TILE_WIDTH = 88;
export const BRAND_TILE_HEIGHT = 72;

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    tile: { width: BRAND_TILE_WIDTH, alignItems: 'center', gap: space[2] },
    pressed: { opacity: 0.8 },
  });

/** A brand as a tile with its logo (or letter) on a white plate and its name under it: one of a row of brands. */
export function BrandTile({ brandId, mark, name, label, onPress }: BrandTileProps) {
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <BrandMark
        brandId={brandId}
        mark={mark}
        width={BRAND_TILE_WIDTH}
        height={BRAND_TILE_HEIGHT}
        inset={space[2]}
      />
      <Text variant="caption" align="center" numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
}
