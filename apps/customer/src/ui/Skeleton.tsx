import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import SHINE from '../../assets/skeleton-shine.png';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { mixColor } from './mixColor';
import { fontSize, leading, radius } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** One value, 0 to 1, that every block in a scope reads: where the shine is on its sweep. */
const ShineContext = createContext<Animated.Value | null>(null);

/** A sweep takes this long, then the blocks rest for a moment before the next, so it reads as a glint and not a flicker. */
const SWEEP_MS = 1100;
const REST_MS = 300;
/**
 * The shine is one soft bar: a small picture of a white band that fades out at both edges (`skeleton-shine.png`), stretched over
 * the block and moved across it. One view per block, and a smooth fall-off a stack of flat strips cannot give. How strong it is
 * depends on what it lies over: strongly on the page's light grey, faintly on the dark theme's and the dark stage's.
 */
const GLOW = { light: 0.85, dark: 0.16, night: 0.12 } as const;
/** The bar is this share of the block's width, kept between these two sizes. */
const BAR_SHARE = 0.55;
const BAR_MIN = 48;
const BAR_MAX = 140;
/**
 * A block thinner or narrower than this (a line of text, a dotted rule, a dot) just stays still. A page of skeleton has a few
 * hundred blocks, and each one that shines is a view the native thread moves on every frame; keeping the shine to the pictures,
 * cards, tiles and buttons keeps that to a hundred or so and the page smooth on a low-end phone.
 */
const SHINE_MIN_HEIGHT = 28;
const SHINE_MIN_WIDTH = 32;

export interface SkeletonScopeProps {
  /** What a screen reader says for the whole group, for example "Loading". Pass a translated string. */
  label: string;
  /** For a skeleton that fills its page and pins something to the bottom, such as the checkout bar: `{ flex: 1 }`. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * Wraps a group of skeleton blocks. A soft shine sweeps across every block on one shared animation (it runs on the native
 * thread, so it stays smooth on a low-end phone), the group is announced once as "loading", and with "reduce motion" on the
 * blocks stay still.
 */
export function SkeletonScope({ label, style, children }: SkeletonScopeProps) {
  const reduceMotion = useReduceMotion();
  const [shine] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      shine.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, {
          toValue: 1,
          duration: SWEEP_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(REST_MS),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [reduceMotion, shine]);

  return (
    <ShineContext value={reduceMotion ? null : shine}>
      <View accessible aria-busy aria-label={label} style={style}>
        {children}
      </View>
    </ShineContext>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    block: { backgroundColor: c.line, overflow: 'hidden' },
    bar: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  });

export interface SkeletonProps {
  width?: DimensionValue;
  /** A fixed height. Leave it out and give `aspectRatio` for a block whose height follows its width (a square tile). */
  height?: number;
  /** Width over height, for example 1 for a square. Used when there is no `height`. */
  aspectRatio?: number;
  /** Corner radius; defaults to a small rounding. */
  rounded?: number;
  /** `night` is for a block on the dark stage (Know your shop): a lift of the stage's own colour, not the page's grey. */
  tone?: 'base' | 'night';
}

/**
 * A grey block standing in for something that is still loading, with a soft shine sweeping across it. Put it inside a
 * `SkeletonScope`: the scope drives one animation for every block, so they glint together.
 */
export function Skeleton({
  width = '100%',
  height,
  aspectRatio,
  rounded = radius.sm,
  tone = 'base',
}: SkeletonProps) {
  const styles = useStyles(makeStyles);
  const { colors, scheme } = useTheme();
  const shine = useContext(ShineContext);
  const [span, setSpan] = useState(0);

  // The block's fill, and how strongly the shine shows over it: on the dark stage a lift of the stage's own colour.
  const base = tone === 'night' ? mixColor(colors.night, colors.onNight, 0.14) : colors.line;
  const glow = tone === 'night' ? GLOW.night : scheme === 'dark' ? GLOW.dark : GLOW.light;
  const bar = Math.min(BAR_MAX, Math.max(BAR_MIN, span * BAR_SHARE));
  const shines =
    shine !== null &&
    span >= SHINE_MIN_WIDTH &&
    (height === undefined || height >= SHINE_MIN_HEIGHT);

  return (
    <View
      aria-hidden
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        setSpan((was) => (was === next ? was : next));
      }}
      style={[
        styles.block,
        {
          backgroundColor: base,
          width,
          ...(height !== undefined ? { height } : {}),
          ...(height === undefined && aspectRatio !== undefined ? { aspectRatio } : {}),
          borderRadius: rounded,
        },
      ]}
    >
      {shines ? (
        <Animated.Image
          source={SHINE}
          resizeMode="stretch"
          aria-hidden
          style={[
            styles.bar,
            {
              width: bar,
              opacity: glow,
              transform: [
                {
                  translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-bar, span] }),
                },
              ],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

export interface SkeletonLineProps {
  /** The text size it stands in for, from the same scale `Text` uses. */
  size: keyof typeof fontSize;
  /** Headings are set tighter than body text. */
  tight?: boolean;
  width?: DimensionValue;
  /** Where the bar sits in the line: the end, for an amount on the right of a row. */
  align?: 'start' | 'end' | 'center';
  /** `night` for a line on the dark stage. */
  tone?: SkeletonProps['tone'];
}

/**
 * A line of text that is still loading: a box as tall as that line really is (the same size and line spacing as `Text`, in
 * the language shown, so Hindi and Marathi get their taller lines) with a bar a little shorter than the letters in the middle.
 * Because the heights agree, a skeleton built from these is the same height as the page that replaces it, and nothing moves
 * when it does.
 */
export function SkeletonLine({
  size,
  tight = false,
  width = '100%',
  align = 'start',
  tone = 'base',
}: SkeletonLineProps) {
  const { locale } = useLanguage();
  const script = locale === 'en' ? 'latin' : 'devanagari';
  const line = Math.round(fontSize[size] * leading[script][tight ? 'tight' : 'normal']);
  const bar = Math.round(fontSize[size] * 0.8);
  return (
    <View
      style={{
        height: line,
        justifyContent: 'center',
        alignItems: align === 'end' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
      }}
    >
      <Skeleton width={width} height={bar} tone={tone} />
    </View>
  );
}
