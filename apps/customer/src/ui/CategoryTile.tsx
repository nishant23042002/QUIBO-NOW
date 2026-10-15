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
  /** Without a handler the tile is a label only (a category that is not here yet). */
  onPress?: () => void;
  /** A small word on the picture's lower edge, for example "Soon" or "Tomorrow". Already translated. */
  tag?: string;
  /** Softened, for something that cannot be opened yet. */
  dimmed?: boolean;
  /** Twice as wide as a tile, showing `emojis` side by side: the way into a group's first category. */
  wide?: boolean;
  /** What a wide tile shows, in order, instead of a picture. */
  emojis?: readonly string[];
  /** The shopper asked to be told when this arrives: the tile turns pistachio and its tag says so. */
  notified?: boolean;
  /** What a screen reader says after the name, for example that a tap turns Notify me on. */
  hint?: string;
}

/** The picture is a square the width of the tile. */
const EMOJI_SIZE = 30;
/**
 * A wide tile covers two cells and the gap between them, so its picture is a little over twice as wide as it is tall: the same
 * height as the square tiles beside it.
 */
const WIDE_RATIO = 2.15;

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
    // A tile with artwork is the picture on its neutral plate, inside the same fine light border as every card.
    plate: {
      flex: 1,
      width: '100%',
      borderRadius: radius.lg,
      backgroundColor: c.artworkPlate,
      overflow: 'hidden',
    },
    boxWide: { aspectRatio: WIDE_RATIO, flexDirection: 'row', gap: space[2] },
    dimmed: { opacity: 0.55 },
    // Asked to be told: the colour of what is saved or on offer, with a pistachio edge.
    notified: { backgroundColor: c.accentSubtle, borderColor: c.accent, borderWidth: 1.5 },
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
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    tagPillNotified: { borderColor: c.accentEdge, backgroundColor: c.accent },
    pressed: { opacity: 0.8 },
    label: { maxWidth: '100%' },
  });

/**
 * One way into a kind of thing: a picture on its colour, and its name under it in at most two lines. The name is the smallest
 * text size the app uses, so a longer Hindi or Marathi name still fits two lines in a four-across grid. A category that is not
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
  wide = false,
  emojis,
  notified = false,
  hint,
}: CategoryTileProps) {
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="button"
      aria-label={[label, tag, hint].filter((part) => part !== undefined).join(', ')}
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
            wide && styles.boxWide,
            dimmed && !notified && styles.dimmed,
            notified && styles.notified,
          ]}
        >
          {wide ? (
            (emojis ?? [emoji]).map((entry) => (
              <NativeText
                key={entry}
                allowFontScaling={false}
                style={{ fontSize: EMOJI_SIZE + 6, lineHeight: EMOJI_SIZE + 14 }}
              >
                {entry}
              </NativeText>
            ))
          ) : picture !== undefined ? (
            <View style={styles.plate}>
              <Image
                source={picture}
                style={styles.artwork}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                aria-hidden
              />
            </View>
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
            <View style={[styles.tagPill, notified && styles.tagPillNotified]}>
              <Text
                variant="caption"
                color={notified ? 'onAccent' : 'ink'}
                align="center"
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {tag}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.label}>
        <Text
          variant="caption"
          color={dimmed && !notified ? 'inkMuted' : 'ink'}
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
