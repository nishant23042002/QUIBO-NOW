import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';
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
}: CartFloatProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
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
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      aria-hidden={!visible}
      style={[
        styles.wrap,
        {
          bottom,
          opacity: shown,
          transform: [
            { translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [HIDDEN_BY, 0] }) },
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
                style={[styles.thumb, index > 0 && styles.overlap, { backgroundColor: thumb.tint }]}
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
  );
}
