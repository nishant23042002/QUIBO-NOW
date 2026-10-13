import {
  Image,
  Pressable,
  Text as NativeText,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
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
  /** The artwork: a square that fills the tile. Without one the emoji is drawn on the colour. */
  picture?: ImageSourcePropType;
  /** Without a handler the tile is a label only (a department that is not here yet). */
  onPress?: () => void;
  /** A small word on the picture's lower edge, for example "Soon" or "Tomorrow". Already translated. */
  tag?: string;
  /** Softened, for something that cannot be opened yet. */
  dimmed?: boolean;
}

/** The picture is a square the width of the tile. */
const EMOJI_SIZE = 30;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tile: { flex: 1, minWidth: 0, alignItems: 'center', gap: space[2] },
    picture: { width: '100%' },
    box: {
      width: '100%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      // Clips artwork to the rounded corners.
      overflow: 'hidden',
    },
    // Sized outright: left to `absoluteFill` alone, the web build keeps the picture at its own pixel size and the tile clips it.
    artwork: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    // A tile with artwork is the picture on its neutral plate, without the department's tint. It keeps the hairline: the plate is
    // almost the page's own colour, so without it the tile has no edge and sits oddly beside the tinted ones.
    plate: { backgroundColor: c.artworkPlate },
    dimmed: { opacity: 0.55 },
    // The tag sits on the picture's lower edge, centred, and never wider than the picture.
    tag: {
      position: 'absolute',
      left: space[1],
      right: space[1],
      bottom: space[1],
      alignItems: 'center',
    },
    tagPill: {
      maxWidth: '100%',
      paddingHorizontal: space[2],
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.8 },
    label: { maxWidth: '100%' },
  });

/**
 * One way into a kind of thing: a picture on its colour, and its name under it in at most two lines. The name is the smallest
 * text size the app uses, so a longer Hindi or Marathi name still fits two lines in a four-across grid. A department that is not
 * here yet is softened and carries a tag instead of opening.
 */
export function CategoryTile({
  label,
  emoji,
  tint,
  picture,
  onPress,
  tag,
  dimmed = false,
}: CategoryTileProps) {
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="button"
      aria-label={tag === undefined ? label : `${label}, ${tag}`}
      aria-disabled={onPress === undefined}
      disabled={onPress === undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.picture}>
        <View
          style={[
            styles.box,
            { backgroundColor: tint },
            picture !== undefined && styles.plate,
            dimmed && styles.dimmed,
          ]}
        >
          {picture !== undefined ? (
            <Image
              source={picture}
              style={styles.artwork}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              aria-hidden
            />
          ) : (
            <NativeText
              allowFontScaling={false}
              style={{ fontSize: EMOJI_SIZE, lineHeight: EMOJI_SIZE + 8 }}
            >
              {emoji}
            </NativeText>
          )}
        </View>
        {tag !== undefined ? (
          <View style={styles.tag} pointerEvents="none">
            <View style={styles.tagPill}>
              <Text variant="caption" align="center" numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {tag}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.label}>
        <Text
          variant="caption"
          color={dimmed ? 'inkMuted' : 'ink'}
          align="center"
          numberOfLines={2}
          maxFontSizeMultiplier={1.2}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
