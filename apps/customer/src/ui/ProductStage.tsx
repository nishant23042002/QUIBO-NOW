import { useState, type ReactNode } from 'react';
import {
  Image,
  Text as NativeText,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { DietMark } from './DietMark';
import { mixColor } from './mixColor';
import { radius, space } from './tokens';

export interface GalleryImage {
  key: string;
  /** What this picture shows, for example "Front". Read out as the picture's name. */
  label: string;
  /** A photo. Until there are photos, the emoji below stands in for the picture. */
  uri?: string;
  /** The stand-in picture: one emoji. */
  emoji: string;
  /** How big the emoji is drawn, as a share of the picture's width, so the stand-ins differ from one another. */
  scale: number;
  /** A quieter view (inside the pack, close up). Kept for the photos; the stage draws every view on the same ground. */
  alt: boolean;
}

export interface ProductStageProps {
  images: readonly GalleryImage[];
  /** The colour of the product's category: the colour the page header wears. The stage is a lighter shade of it. */
  tint: string;
  /** A picture's name for a screen reader, for example "Photo 2 of 3". */
  photoLabel: (position: number, total: number) => string;
  /** Dims the pictures, for a product that cannot be bought. */
  faded?: boolean;
  /** The saving ribbon. It hangs from the stage's top edge, which is the header's lower edge. */
  ribbon?: ReactNode;
  /** Whether the product is vegetarian: a mark in the stage's top right corner. */
  diet?: { kind: 'veg' | 'nonveg'; label: string };
  /** The insight button and its card (`ProductInsight`), laid over the picture. */
  insight?: ReactNode;
  /** The other-brands button (`OtherBrandsButton`), in the lower right corner; it steps aside while the insight card is open. */
  others?: ReactNode;
  /** The insight card is open: the ribbon, the diet mark, the dots and the other-brands button step aside so they do not show through it. */
  quiet?: boolean;
}

/** Width over height of the stage. The page's loading skeleton and the header's reveal distance use the same number. */
export const STAGE_RATIO = 1.1;

/** How much of the page's colour is in the top of the stage. 0 is the header's own tint, 1 is the page. */
const TOP_EASE = 0.5;
const DOT = 6;
const DOT_ACTIVE = 18;
/** The buttons are 40 dp and sit 16 dp from the corners; the dots are centred on them. */
const DOTS_BOTTOM = space[4] + (40 - DOT) / 2;

/** The colour at the top of the stage, which is also what shows behind the header's rounded lower corners. */
export function stageTopColor(tint: string, page: string): string {
  return mixColor(tint, page, TOP_EASE);
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    stage: { overflow: 'hidden' },
    ground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    slide: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    over: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    ribbon: { position: 'absolute', top: 0, left: space[4] },
    diet: {
      position: 'absolute',
      top: space[3],
      right: space[4],
      padding: 2,
      borderRadius: radius.sm,
      backgroundColor: c.surface,
    },
    dots: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: DOTS_BOTTOM,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1] + 2,
    },
    dot: { width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: c.ink, opacity: 0.25 },
    dotOn: { width: DOT_ACTIVE, opacity: 1 },
  });

/**
 * The product's pictures as a stage: full width, in a lighter shade of the header's tint that fades into the page, so the header
 * reads as a deeper sheet laid over the picture. The picture swipes sideways; small dots under it show how many there are and which
 * one is showing (there is no thumbnail strip). The saving ribbon hangs from the top edge, the vegetarian mark sits in the top right
 * corner, and the insight button and its card (passed in) sit at the lower left and the other-brands button at the lower right. A product with one picture shows no dots. Each
 * picture is a photo when it has one, and a stand-in drawn from the product's emoji until then.
 */
export function ProductStage({
  images,
  tint,
  photoLabel,
  faded = false,
  ribbon,
  diet,
  insight,
  others,
  quiet = false,
}: ProductStageProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const window = useWindowDimensions();
  // The first frame is already drawn at full size from the window; the measured width replaces it.
  const [measured, setMeasured] = useState(0);
  const width = measured > 0 ? measured : Math.round(window.width);
  const height = Math.round(width / STAGE_RATIO);
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(images.length - 1, next)));
  };

  return (
    <View
      style={[styles.stage, { height }]}
      onLayout={(event) => {
        setMeasured(Math.round(event.nativeEvent.layout.width));
      }}
    >
      <Svg style={styles.ground} width="100%" height="100%" aria-hidden>
        <Defs>
          <LinearGradient id="productStage" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={stageTopColor(tint, colors.bg)} />
            <Stop offset="1" stopColor={colors.bg} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#productStage)" />
      </Svg>

      <ScrollView
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
            style={[styles.slide, { width, height }]}
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

      <View style={styles.over} pointerEvents="box-none">
        {ribbon !== undefined && !quiet ? <View style={styles.ribbon}>{ribbon}</View> : null}
        {diet !== undefined && !quiet ? (
          <View style={styles.diet}>
            <DietMark kind={diet.kind} label={diet.label} size={20} />
          </View>
        ) : null}
        {many && !quiet ? (
          <View style={styles.dots} aria-hidden pointerEvents="none">
            {images.map((image, position) => (
              <View key={image.key} style={[styles.dot, position === index && styles.dotOn]} />
            ))}
          </View>
        ) : null}
        {insight}
        {others !== undefined && !quiet ? others : null}
      </View>
    </View>
  );
}
