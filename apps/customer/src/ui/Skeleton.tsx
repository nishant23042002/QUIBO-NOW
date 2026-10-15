import { useEffect, useState, type ReactNode } from 'react';
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
import { fontSize, leading, radius } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** A sweep takes this long, then the page rests a moment before the next, so it reads as a glint and not a flicker. */
const SWEEP_MS = 1200;
const REST_MS = 500;
/** The band is this share of the screen's width, kept between these two sizes. */
const BAND_SHARE = 0.4;
const BAND_MIN = 120;
const BAND_MAX = 220;
/** How strongly the band shows: plainly over the page's light grey, faintly over the dark theme's grey. */
const GLOW = { light: 0.7, dark: 0.1 } as const;

export interface SkeletonScopeProps {
  /** What a screen reader says for the whole group, for example "Loading". Pass a translated string. */
  label: string;
  /** For a skeleton that fills its page and pins something to the bottom, such as the checkout bar: `{ flex: 1 }`. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const makeScopeStyles = () =>
  StyleSheet.create({
    scope: { overflow: 'hidden' },
    // One band for the whole group, laid over it, taking no touches.
    band: { position: 'absolute', top: 0, bottom: 0, left: 0, pointerEvents: 'none' },
  });

/**
 * Wraps a group of skeleton blocks. One soft band of light sweeps across the whole group, then rests: it is white, so it is
 * seen over the grey blocks and not over the white page between them, which is all the shine a skeleton needs. It is a single
 * view moved by the native thread, so the blocks themselves do nothing and a page of hundreds of them costs the same as one.
 * The group is announced once as "loading", and with "reduce motion" on it stays still.
 */
export function SkeletonScope({ label, style, children }: SkeletonScopeProps) {
  const styles = useStyles(makeScopeStyles);
  const { scheme } = useTheme();
  const reduceMotion = useReduceMotion();
  const [sweep] = useState(() => new Animated.Value(0));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      sweep.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
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
  }, [reduceMotion, sweep]);

  const band = Math.min(BAND_MAX, Math.max(BAND_MIN, width * BAND_SHARE));

  return (
    <View
      accessible
      aria-busy
      aria-label={label}
      style={[styles.scope, style]}
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        setWidth((was) => (was === next ? was : next));
      }}
    >
      {children}
      {!reduceMotion && width > 0 ? (
        <Animated.Image
          source={SHINE}
          resizeMode="stretch"
          aria-hidden
          style={[
            styles.band,
            {
              width: band,
              opacity: scheme === 'dark' ? GLOW.dark : GLOW.light,
              transform: [
                {
                  translateX: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-band, width],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({ block: { backgroundColor: c.line } });

export interface SkeletonProps {
  width?: DimensionValue;
  /** A fixed height. Leave it out and give `aspectRatio` for a block whose height follows its width (a square tile). */
  height?: number;
  /** Width over height, for example 1 for a square. Used when there is no `height`. */
  aspectRatio?: number;
  /** Corner radius; defaults to a small rounding. */
  rounded?: number;
}

/** A grey block standing in for something that is still loading. Put it inside a `SkeletonScope`, which brings the shine. */
export function Skeleton({
  width = '100%',
  height,
  aspectRatio,
  rounded = radius.sm,
}: SkeletonProps) {
  const styles = useStyles(makeStyles);

  return (
    <View
      aria-hidden
      style={[
        styles.block,
        {
          width,
          ...(height !== undefined ? { height } : {}),
          ...(height === undefined && aspectRatio !== undefined ? { aspectRatio } : {}),
          borderRadius: rounded,
        },
      ]}
    />
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
      <Skeleton width={width} height={bar} />
    </View>
  );
}
