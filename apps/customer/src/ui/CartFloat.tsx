import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useChromeProgress } from './chrome';
import { Icon } from './Icon';
import { Text } from './Text';
import { BOTTOM_BAR_HEIGHT, radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** One product in the cart, drawn as a small round picture. */
export interface CartThumb {
  key: string;
  /** The product's emoji, until real photos exist. */
  emoji: string;
  /** The colour behind it, the same as on the product's own card. */
  tint: string;
}

export interface CartFloatProps {
  /** Whether there is anything in the cart. The bar slides up when it becomes true and away when it becomes false. */
  visible: boolean;
  /** The products in the cart, latest first. Up to three are drawn, overlapping; the rest are folded into `moreLabel`. */
  thumbs: readonly CartThumb[];
  /** When there are more products than fit, the number left over as a bubble, for example "+2". */
  moreLabel?: string;
  /** How many items, already worded and pluralised, for example "3 items". */
  itemsLabel: string;
  /** The total, already formatted, for example "₹126". */
  totalLabel: string;
  /** The shop the cart is from, already worded, for example "From Sharma Dairy" or "2 shops". */
  shopLabel: string;
  /** What the cart saves, for example "You saved ₹7". Leave out when it saves nothing. */
  savedLabel?: string;
  /** The line in the strip along the top: how far to free delivery, or that it is unlocked. */
  hint: string;
  /** How close the cart is to free delivery, from 0 to 1. It fills the thin line along the bottom. */
  progress: number;
  actionLabel: string;
  onPress: () => void;
  /**
   * How far the bar's bottom edge sits above the bottom of the screen: the solid strip behind the phone's
   * navigation buttons, plus the height of the bottom navigation bar once it exists. The bar rests right on
   * top of that, with no gap.
   */
  bottom: number;
  /**
   * Follows the bottom bar: when the page is scrolled down and the bar slides away, this bar sinks into the room it leaves and
   * turns into a small pill at the lower right, and it comes back when the bar does. Leave it off on a screen whose bar never hides.
   */
  follow?: boolean;
}

/** The bar stays on screen over every page, so its text grows with the phone's text size only this far. */
const SCALE_MAX = 1.3;

const HIDDEN_BY = 140;
const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;
const THUMB = 34;
const RING = 2;
const OVERLAP = 12;
const SHINE_MS = 900;
const SHINE_PAUSE_MS = 1100;
const HALO_MS = 1500;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // Docked: the full width of the screen, resting on whatever is below it, with rounded top corners.
    wrap: { position: 'absolute', left: 0, right: 0 },
    bar: {
      overflow: 'hidden',
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      backgroundColor: c.chrome,
    },
    // The strip along the top: how close the cart is to free delivery, and what it saves.
    strip: {
      minHeight: 26,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    stripBg: { ...FILL, backgroundColor: c.onChromeMuted, opacity: 0.16 },
    stripHint: { flexShrink: 1 },
    saved: { flexShrink: 0 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[2],
    },
    thumbs: { flexDirection: 'row', alignItems: 'center' },
    thumb: {
      width: THUMB + RING * 2,
      height: THUMB + RING * 2,
      borderRadius: radius.full,
      borderWidth: RING,
      borderColor: c.chrome,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlap: { marginLeft: -OVERLAP },
    more: { backgroundColor: c.accent },
    text: { flex: 1, minWidth: 0 },
    // The button, and the halo that pulses around it.
    actionBox: { alignItems: 'center', justifyContent: 'center' },
    halo: {
      ...FILL,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.accent,
    },
    action: {
      minHeight: space[10],
      justifyContent: 'center',
      paddingHorizontal: space[4],
      borderRadius: radius.full,
      overflow: 'hidden',
      // A little deeper than the bag's pistachio, so the white band of light stands out against it.
      backgroundColor: c.accentPressed,
    },
    // The shine: a slanted band of light with a bright core and soft edges, sweeping across the button.
    shine: { position: 'absolute', top: -24, bottom: -24, left: 0, flexDirection: 'row' },
    stripe: { backgroundColor: c.headerControl },
    pressed: { opacity: 0.94 },
    // The small form, at the lower right while the bottom bar is away: a picture, two short lines, and a square pistachio button.
    pill: {
      position: 'absolute',
      right: space[3],
      overflow: 'hidden',
      borderRadius: radius.lg,
      backgroundColor: c.chrome,
    },
    pillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingLeft: space[3],
      paddingRight: space[2],
      paddingTop: space[2],
      paddingBottom: space[2] + 3,
    },
    pillGo: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.accent,
    },
    pillText: { flexShrink: 1 },
    pillTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3 },
    pillFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
    pillTrackBg: { ...FILL, backgroundColor: c.onChromeMuted, opacity: 0.35 },
    // The fine line along the bottom: how much of the way to free delivery.
    track: { height: 4, backgroundColor: c.onChromeMuted, opacity: 0.35 },
    fill: { position: 'absolute', left: 0, bottom: 0, height: 4, backgroundColor: c.accent },
    shopRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  });

/**
 * The bar docked to the bottom of Home once the cart has something in it, resting on the strip behind the
 * phone's navigation buttons (and on the bottom navigation bar when that exists). A strip along its top shows
 * how close the cart is to free delivery, filling as it nears; below it are small round pictures of what is
 * in the cart (up to three, overlapping, with a "+N" bubble for the rest), the item count and total, and a
 * "View cart" button that keeps drawing the eye: a bright band of light sweeps across it, and a ring pulses
 * out around it. It slides up when the first item is added and pops when the count changes. With "reduce
 * motion" on, the shine and the ring stay still.
 */
export function CartFloat({
  visible,
  thumbs,
  moreLabel,
  itemsLabel,
  totalLabel,
  shopLabel,
  savedLabel,
  hint,
  progress,
  actionLabel,
  onPress,
  bottom,
  follow = false,
}: CartFloatProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const chromeProgress = useChromeProgress();
  const [still] = useState(() => new Animated.Value(0));
  // 0 with the bottom bar in place and the full bar showing, 1 with the bar away and the pill showing.
  const away = follow ? chromeProgress : still;
  const [compact, setCompact] = useState(false);
  const [pillWidth, setPillWidth] = useState(0);

  useEffect(() => {
    if (!follow) return undefined;
    const id = chromeProgress.addListener(({ value }) => {
      setCompact(value > 0.5);
    });
    return () => {
      chromeProgress.removeListener(id);
    };
  }, [follow, chromeProgress]);
  const [shown] = useState(() => new Animated.Value(visible ? 1 : 0));
  const [pop] = useState(() => new Animated.Value(1));
  const [sweep] = useState(() => new Animated.Value(0));
  const [halo] = useState(() => new Animated.Value(0));
  const lastLabel = useRef(itemsLabel);
  const [width, setWidth] = useState(0);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      shown.setValue(visible ? 1 : 0);
      return undefined;
    }
    const slide = Animated.timing(shown, {
      toValue: visible ? 1 : 0,
      duration: visible ? 320 : 220,
      easing: visible ? Easing.out(Easing.back(1.1)) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    slide.start();
    return () => {
      slide.stop();
    };
  }, [visible, reduceMotion, shown]);

  // A small pop each time the count changes, so adding and removing feels acknowledged.
  useEffect(() => {
    if (lastLabel.current === itemsLabel) return;
    lastLabel.current = itemsLabel;
    if (reduceMotion || !visible) return;
    pop.setValue(0.96);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 240, useNativeDriver: true }).start();
  }, [itemsLabel, visible, reduceMotion, pop]);

  // The shine and the ring, for as long as the bar shows: a band of light crosses the button, a ring pulses
  // out from it, and then they rest a moment before starting again.
  useEffect(() => {
    if (reduceMotion || !visible) return undefined;
    sweep.setValue(0);
    halo.setValue(0);
    const shine = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: SHINE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(SHINE_PAUSE_MS),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, {
          toValue: 1,
          duration: HALO_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(halo, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    shine.start();
    ring.start();
    return () => {
      shine.stop();
      ring.stop();
    };
  }, [visible, reduceMotion, sweep, halo]);

  const fill = width * Math.min(Math.max(progress, 0), 1);

  return (
    <>
      <Animated.View
        pointerEvents={visible && !compact ? 'box-none' : 'none'}
        aria-hidden={!visible || compact}
        style={[
          styles.wrap,
          {
            bottom,
            // Fades out quickly as it sinks, so the pill takes its place without the two showing at once.
            opacity: Animated.multiply(
              shown,
              away.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }),
            ),
            transform: [
              {
                translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [HIDDEN_BY, 0] }),
              },
              {
                translateY: reduceMotion
                  ? 0
                  : away.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, BOTTOM_BAR_HEIGHT],
                    }),
              },
              { scale: pop },
            ],
          },
        ]}
      >
        <Pressable
          role="button"
          aria-label={`${itemsLabel}. ${totalLabel}. ${shopLabel}. ${hint}. ${savedLabel ?? ''}. ${actionLabel}`}
          onPress={onPress}
          style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
          onLayout={(event) => {
            setWidth(event.nativeEvent.layout.width);
          }}
        >
          <View style={styles.strip} aria-hidden>
            <View style={styles.stripBg} />
            <View style={styles.stripHint}>
              <Text
                variant="caption"
                color="onChrome"
                numberOfLines={1}
                maxFontSizeMultiplier={SCALE_MAX}
              >
                {hint}
              </Text>
            </View>
            {savedLabel !== undefined ? (
              <View style={styles.saved}>
                <Text
                  variant="caption"
                  color="accent"
                  numberOfLines={1}
                  maxFontSizeMultiplier={SCALE_MAX}
                >
                  {savedLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.row}>
            <View style={styles.thumbs} aria-hidden>
              {thumbs.map((thumb, index) => (
                <View
                  key={thumb.key}
                  style={[
                    styles.thumb,
                    index > 0 && styles.overlap,
                    { backgroundColor: thumb.tint },
                  ]}
                >
                  <NativeText allowFontScaling={false} style={{ fontSize: 18, lineHeight: 24 }}>
                    {thumb.emoji}
                  </NativeText>
                </View>
              ))}
              {moreLabel !== undefined ? (
                <View style={[styles.thumb, styles.overlap, styles.more]}>
                  <Text variant="caption" color="onAccent" maxFontSizeMultiplier={1}>
                    {moreLabel}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.text}>
              <Text
                variant="label"
                color="onChrome"
                numberOfLines={1}
                maxFontSizeMultiplier={SCALE_MAX}
              >
                {`${itemsLabel} · ${totalLabel}`}
              </Text>
              <View style={styles.shopRow}>
                <Icon name="store" color={colors.onChromeMuted} size={14} />
                <View style={styles.stripHint}>
                  <Text
                    variant="small"
                    color="onChromeMuted"
                    numberOfLines={1}
                    maxFontSizeMultiplier={SCALE_MAX}
                  >
                    {shopLabel}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actionBox} aria-hidden>
              {reduceMotion ? null : (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.halo,
                    {
                      opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
                      transform: [
                        { scale: halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) },
                      ],
                    },
                  ]}
                />
              )}
              <View
                style={styles.action}
                onLayout={(event) => {
                  setButtonWidth(event.nativeEvent.layout.width);
                }}
              >
                <Text
                  variant="strong"
                  color="onAccent"
                  numberOfLines={1}
                  maxFontSizeMultiplier={SCALE_MAX}
                >
                  {actionLabel}
                </Text>
                {reduceMotion || buttonWidth === 0 ? null : (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.shine,
                      {
                        opacity: sweep.interpolate({
                          inputRange: [0, 0.08, 0.92, 1],
                          outputRange: [0, 1, 1, 0],
                        }),
                        transform: [
                          {
                            translateX: sweep.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-50, buttonWidth + 30],
                            }),
                          },
                          { rotate: '18deg' },
                        ],
                      },
                    ]}
                  >
                    <View style={[styles.stripe, { width: 8, opacity: 0.3 }]} />
                    <View style={[styles.stripe, { width: 14, opacity: 0.95 }]} />
                    <View style={[styles.stripe, { width: 8, opacity: 0.3 }]} />
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
          {/* The fine line along the bottom: how much of the way to free delivery. */}
          <View style={styles.track} aria-hidden />
          <View style={[styles.fill, { width: fill }]} aria-hidden />
        </Pressable>
      </Animated.View>
      {follow ? (
        <Animated.View
          pointerEvents={visible && compact ? 'box-none' : 'none'}
          aria-hidden={!visible || !compact}
          style={[
            styles.pill,
            {
              // Rests in the corner where the bottom bar's strip was, clear of the phone's own buttons.
              bottom: bottom - BOTTOM_BAR_HEIGHT + space[3],
              opacity: Animated.multiply(
                shown,
                away.interpolate({
                  inputRange: [0.4, 1],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              ),
              transform: [
                {
                  translateY: reduceMotion
                    ? 0
                    : away.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
                },
              ],
            },
          ]}
        >
          <Pressable
            role="button"
            aria-label={`${itemsLabel}. ${totalLabel}. ${actionLabel}`}
            onPress={onPress}
            onLayout={(event) => {
              setPillWidth(event.nativeEvent.layout.width);
            }}
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <View style={styles.pillRow}>
              {thumbs[0] !== undefined ? (
                <View style={[styles.thumb, { backgroundColor: thumbs[0].tint }]} aria-hidden>
                  <NativeText allowFontScaling={false} style={{ fontSize: 18, lineHeight: 24 }}>
                    {thumbs[0].emoji}
                  </NativeText>
                </View>
              ) : null}
              <View style={styles.pillText}>
                <Text
                  variant="strong"
                  color="onChrome"
                  numberOfLines={1}
                  maxFontSizeMultiplier={SCALE_MAX}
                >
                  {actionLabel}
                </Text>
                <Text
                  variant="small"
                  color="onChromeMuted"
                  numberOfLines={1}
                  maxFontSizeMultiplier={SCALE_MAX}
                >
                  {`${itemsLabel} · ${totalLabel}`}
                </Text>
              </View>
              <View style={styles.pillGo} aria-hidden>
                <Icon name="chevronRight" color={colors.onAccent} size={20} />
              </View>
            </View>
            {/* The same fine line as the full bar: how much of the way to free delivery. */}
            <View style={styles.pillTrack} aria-hidden>
              <View style={styles.pillTrackBg} />
              <View
                style={[
                  styles.pillFill,
                  {
                    width: pillWidth * Math.min(Math.max(progress, 0), 1),
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </>
  );
}
