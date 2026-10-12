import { Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface CategoryTileProps {
  /** The name in the current language. It takes up to two lines. */
  label: string;
  /** A stand-in for the picture, until real artwork exists. */
  emoji: string;
  /** The colour behind the picture. */
  tint: string;
  onPress: () => void;
}

/** The picture is a square the width of the tile. */
const EMOJI_SIZE = 30;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tile: { flex: 1, minWidth: 0, alignItems: 'center', gap: space[2] },
    box: {
      width: '100%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
    },
    pressed: { opacity: 0.8 },
    label: { maxWidth: '100%' },
  });

/**
 * One way into a kind of thing: a picture on its colour, and its name under it in at most two lines. The name is the smallest
 * text size the app uses, so a longer Hindi or Marathi name still fits two lines in a four-across grid.
 */
export function CategoryTile({ label, emoji, tint, onPress }: CategoryTileProps) {
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={[styles.box, { backgroundColor: tint }]}>
        <NativeText
          allowFontScaling={false}
          style={{ fontSize: EMOJI_SIZE, lineHeight: EMOJI_SIZE + 8 }}
        >
          {emoji}
        </NativeText>
      </View>
      <View style={styles.label}>
        <Text variant="caption" align="center" numberOfLines={2} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
