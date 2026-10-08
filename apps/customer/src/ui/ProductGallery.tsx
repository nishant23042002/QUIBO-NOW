import { useRef, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  Text as NativeText,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface GalleryImage {
  key: string;
  /** What this picture shows, for example "Front". Read out, and the name of its thumbnail. */
  label: string;
  /** A photo. Until there are photos, the emoji below stands in for the picture. */
  uri?: string;
  /** The stand-in picture: one emoji. */
  emoji: string;
  /** How big the emoji is drawn, as a share of the picture's width, so the stand-ins differ from one another. */
  scale: number;
  /** Drawn on the quieter background instead of the product's own tint. */
  alt: boolean;
}

export interface ProductGalleryProps {
  images: readonly GalleryImage[];
  /** The colour behind a picture: the product's category tint. */
  tint: string;
  /** The picture's name for a screen reader, for example "Photo 2 of 3". */
  photoLabel: (position: number, total: number) => string;
  /** Dims the pictures, for a product that cannot be bought. */
  faded?: boolean;
  /**
   * The width the card is expected to have, so the first frame is already drawn at full size and the pictures do not
   * pop in after the card has been measured. The measured width replaces it.
   */
  initialWidth?: number;
  /** Drawn over the top of the pictures, for example the saving ribbon. It does not swipe. */
  overlay?: ReactNode;
}

/** Width over height of the big picture. The page's loading skeleton uses the same number. */
export const GALLERY_RATIO = 1.1;
const THUMB = 52;
/** The card's border on each side. */
const BORDER = 1;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    slide: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    over: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    // "2/3" in the picture's corner, so the shopper knows there is more to swipe to.
    count: {
      position: 'absolute',
      top: space[2],
      right: space[2],
      paddingHorizontal: space[2],
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    thumbs: { flexDirection: 'row', gap: space[2], padding: space[3] },
    thumb: {
      width: THUMB,
      height: THUMB,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: c.line,
    },
    thumbOn: { borderColor: c.action },
    pressed: { opacity: 0.8 },
  });

/**
 * The pictures of a product in a card: a big one that swipes sideways, with a small strip of thumbnails under it
 * (tap one to go to it) and a "2/3" count in the corner. A product with one picture shows just that, with no
 * strip and no count. Each picture is a photo when it has one, and a stand-in drawn from the product's emoji until
 * then, so real photos drop in without changing the screen.
 */
export function ProductGallery({
  images,
  tint,
  photoLabel,
  faded = false,
  initialWidth = 0,
  overlay,
}: ProductGalleryProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const scroller = useRef<ScrollView>(null);
  // `initialWidth` is the card's outer width; the swiping area is inside its border.
  const [width, setWidth] = useState(Math.max(0, initialWidth - BORDER * 2));
  const [index, setIndex] = useState(0);
  const height = Math.round(width / GALLERY_RATIO);
  const many = images.length > 1;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(images.length - 1, next)));
  };

  const background = (image: GalleryImage) => (image.alt ? colors.muted : tint);

  return (
    <View style={styles.card}>
      {/* The width that counts is the room inside the card's border: that is the width of the swiping area, so a
          picture is exactly one page wide and a swipe settles with it in the middle. */}
      <View
        onLayout={(event) => {
          setWidth(Math.round(event.nativeEvent.layout.width));
        }}
      >
        {width > 0 ? (
          <>
            <ScrollView
              ref={scroller}
              horizontal
              pagingEnabled
              snapToInterval={width}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onScroll}
            >
              {images.map((image, position) => (
                <View
                  key={image.key}
                  accessible
                  role="img"
                  aria-label={`${photoLabel(position + 1, images.length)}. ${image.label}`}
                  style={[styles.slide, { width, height, backgroundColor: background(image) }]}
                >
                  {image.uri !== undefined ? (
                    <Image source={{ uri: image.uri }} style={styles.photo} resizeMode="cover" />
                  ) : (
                    <NativeText
                      allowFontScaling={false}
                      aria-hidden
                      style={{
                        fontSize: width * image.scale,
                        lineHeight: width * image.scale * 1.25,
                        opacity: faded ? 0.35 : 1,
                      }}
                    >
                      {image.emoji}
                    </NativeText>
                  )}
                </View>
              ))}
            </ScrollView>
            {overlay !== undefined ? (
              <View style={styles.over} pointerEvents="box-none">
                {overlay}
              </View>
            ) : null}
            {many ? (
              <View style={styles.count} aria-hidden>
                <Text variant="caption">{`${index + 1}/${images.length}`}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={{ height: Math.round(initialWidth / GALLERY_RATIO) }} />
        )}
      </View>
      {many ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.thumbs}>
            {images.map((image, position) => (
              <Pressable
                key={image.key}
                role="button"
                aria-label={`${image.label}. ${photoLabel(position + 1, images.length)}`}
                aria-selected={position === index}
                onPress={() => {
                  scroller.current?.scrollTo({ x: position * width, animated: !reduceMotion });
                  setIndex(position);
                }}
                style={({ pressed }) => [
                  styles.thumb,
                  { backgroundColor: background(image) },
                  position === index && styles.thumbOn,
                  pressed && styles.pressed,
                ]}
              >
                {image.uri !== undefined ? (
                  <Image source={{ uri: image.uri }} style={styles.photo} resizeMode="cover" />
                ) : (
                  <NativeText allowFontScaling={false} aria-hidden style={{ fontSize: 24 }}>
                    {image.emoji}
                  </NativeText>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
