import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface BrandTileProps {
  /** The letter drawn on the tile, until there is a logo (ADR 0036). */
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

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tile: { width: BRAND_TILE_WIDTH, alignItems: 'center', gap: space[2] },
    mark: {
      width: BRAND_TILE_WIDTH,
      height: BRAND_TILE_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.8 },
  });

/** A brand as a tile with its letter and its name under it: one of a row of "Brands in this category". */
export function BrandTile({ mark, name, label, onPress }: BrandTileProps) {
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.mark}>
        <Text variant="heading">{mark}</Text>
      </View>
      <Text variant="caption" align="center" numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
}
