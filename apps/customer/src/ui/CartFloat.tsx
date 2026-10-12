import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useChromeProgress } from './chrome';
import SCOOTER_CLASSIC from '../../assets/delivery-scooter.png';
import SCOOTER_MONO from '../../assets/delivery-scooter-mono.png';
import { Icon } from './Icon';
import { DELIVERY_ART, artTint, type DeliveryArt } from './logic/deliveryArt';
import { ProgressImage } from './ProgressImage';
import { Text } from './Text';
import { BOTTOM_BAR_HEIGHT, TAP_MIN, radius, space } from './tokens';
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
   * shrinks into a small cart button at the lower right, with a separate free-delivery note beside it at the left. They go back
   * when the bar does. Leave it off on a screen whose bar never hides.
   */
  follow?: boolean;
  /** Free delivery has been reached: the note says so, and its icon turns pistachio. */
  free?: boolean;
  /** The note's two short lines, already worded: for example "₹53 more" over "for free delivery", or "Free delivery" over "unlocked". */
  pillTitle?: string;
  pillSub?: string;
}

/** The bar stays on screen over every page, so its text grows with the phone's text size only this far. */
const SCALE_MAX = 1.3;

const HIDDEN_BY = 140;
/** How far the collapsed note and button sit in from the screen's sides and up from its bottom strip. */
const PILL_MARGIN = space[2];
/** The delivery scooter: it is the free-delivery progress bar, filling from its left as the cart nears it. Which one shows is `DELIVERY_ART`. */
const NOTE_PICTURE = 38;
const SCOOTERS: Readonly<Record<DeliveryArt, number>> = {
  classic: SCOOTER_CLASSIC,
  mono: SCOOTER_MONO,
};
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
    // The collapsed form, at the bottom while the bottom bar is away: two separate pieces side by side. At the left a dark note
    // about free delivery; at the right a pistachio cart button, which is what the full bar shrinks into. Corners are the app's
    // large radius, not a capsule.
    collapsed: {
      position: 'absolute',
      left: PILL_MARGIN,
      right: PILL_MARGIN,
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: PILL_MARGIN,
    },
    note: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      borderRadius: radius.md,
      backgroundColor: c.chrome,
    },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingLeft: space[1] + 2,
      paddingRight: space[3],
      paddingVertical: space[1],
    },
    noteTile: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
    },
    // A small pistachio tick on the picture's lower right once free delivery is reached.
    noteCheck: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      width: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.accent,
      borderWidth: 2,
      borderColor: c.chrome,
    },
    noteText: { flexShrink: 1 },
    cartButton: {
      minHeight: TAP_MIN,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[3],
      borderRadius: radius.md,
      backgroundColor: c.accent,
    },
    cartText: { flexShrink: 0 },
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
  free = false,
  pillTitle = '',
  pillSub = '',
}: CartFloatProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const chromeProgress = useChromeProgress();
  const [still] = useState(() => new Animated.Value(0));
  // 0 with the bottom bar in place and the full bar showing, 1 with the bar away and the pill showing.
  const away = follow ? chromeProgress : still;
  // How big the full bar and the pill are, so the bar can shrink into the pill's place as one shape.
  const [barHeight, setBarHeight] = useState(0);
  const [pill, setPill] = useState({ width: 0, height: 0 });
  const [unlockedPop] = useState(() => new Animated.Value(1));
  const wasFree = useRef(free);
  const tintName = artTint(DELIVERY_ART, free);

  // The icon tile gives a small pop when free delivery is reached, so the moment is noticed.
  useEffect(() => {
    if (wasFree.current === free) return;
    wasFree.current = free;
    if (!free || reduceMotion) return;
    unlockedPop.setValue(0.7);
    Animated.spring(unlockedPop, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [free, reduceMotion, unlockedPop]);
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
      // Short and firm in both directions, so the bar and the control that caused it move together.
      duration: visible ? 220 : 180,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
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

  // The bar and the pill are the same dark shape at two sizes. While the bottom bar slides away, the bar sinks with it (as if it
  // were stacked on it), shrinks toward the pill's corner, and its words fade early; the pill's words arrive as it lands. The pill
  // is a real element of its own, so what is left at the end is exactly it.
  const morph = follow && !reduceMotion && width > 0 && barHeight > 0 && pill.width > 0;
  const ratioX = morph ? Math.min(1, pill.width / width) : 1;
  const ratioY = morph ? Math.min(1, pill.height / barHeight) : 1;
  const moveX = morph ? (width * (1 - ratioX)) / 2 - PILL_MARGIN : 0;
  const moveY = morph ? BOTTOM_BAR_HEIGHT - PILL_MARGIN + (barHeight * (1 - ratioY)) / 2 : 0;
  const wordsFade = away.interpolate({
    inputRange: [0, 0.3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const barFade = away.interpolate({
    inputRange: [0.8, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const pillFade = away.interpolate({
    inputRange: [0.55, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.View
        pointerEvents={visible ? 'box-none' : 'none'}
        aria-hidden={!visible}
        style={[
          styles.wrap,
          {
            bottom,
            opacity: Animated.multiply(shown, barFade),
            transform: [
              {
                translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [HIDDEN_BY, 0] }),
              },
              { translateX: away.interpolate({ inputRange: [0, 1], outputRange: [0, moveX] }) },
              { translateY: away.interpolate({ inputRange: [0, 1], outputRange: [0, moveY] }) },
              { scaleX: away.interpolate({ inputRange: [0, 1], outputRange: [1, ratioX] }) },
              { scaleY: away.interpolate({ inputRange: [0, 1], outputRange: [1, ratioY] }) },
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
            setBarHeight(event.nativeEvent.layout.height);
          }}
        >
          <Animated.View style={{ opacity: wordsFade }}>
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
                          {
                            scale: halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }),
                          },
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
          </Animated.View>
          {/* The fine line along the bottom: how much of the way to free delivery. */}
          <View style={styles.track} aria-hidden />
          <View style={[styles.fill, { width: fill }]} aria-hidden />
        </Pressable>
      </Animated.View>
      {follow ? (
        <Animated.View
          pointerEvents={visible ? 'box-none' : 'none'}
          aria-hidden
          style={[
            styles.collapsed,
            {
              // Rests where the bottom bar's strip was, clear of the phone's own buttons.
              bottom: bottom - BOTTOM_BAR_HEIGHT + PILL_MARGIN,
              opacity: Animated.multiply(shown, pillFade),
            },
          ]}
        >
          {/* The note: how far free delivery is, or that it is unlocked. It slides in from the left as the bar settles. */}
          <Animated.View
            style={[
              styles.note,
              {
                transform: [
                  {
                    translateX: away.interpolate({
                      inputRange: [0.4, 1],
                      outputRange: [-24, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={onPress}
              style={({ pressed }) => (pressed ? styles.pressed : null)}
              role="button"
              aria-label={`${pillTitle} ${pillSub}. ${actionLabel}`}
            >
              <View style={styles.noteRow}>
                <Animated.View style={[styles.noteTile, { transform: [{ scale: unlockedPop }] }]}>
                  <ProgressImage
                    source={SCOOTERS[DELIVERY_ART]}
                    progress={free ? 1 : progress}
                    size={NOTE_PICTURE}
                    tint={tintName === null ? undefined : colors[tintName]}
                  />
                  {free ? (
                    <View style={styles.noteCheck}>
                      <Icon name="check" color={colors.onAccent} size={12} />
                    </View>
                  ) : null}
                </Animated.View>
                <View style={styles.noteText}>
                  <Text
                    variant="strong"
                    color={free ? 'accent' : 'onChrome'}
                    numberOfLines={1}
                    maxFontSizeMultiplier={SCALE_MAX}
                  >
                    {pillTitle}
                  </Text>
                  <Text
                    variant="caption"
                    color="onChromeMuted"
                    numberOfLines={1}
                    maxFontSizeMultiplier={SCALE_MAX}
                  >
                    {pillSub}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
          {/* The cart button: a static cart icon, never the items, with the count in words beside it. */}
          <Pressable
            role="button"
            aria-label={`${itemsLabel}. ${totalLabel}. ${actionLabel}`}
            onPress={onPress}
            style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
            onLayout={(event) => {
              const { width: w, height: h } = event.nativeEvent.layout;
              setPill((current) =>
                current.width === w && current.height === h ? current : { width: w, height: h },
              );
            }}
          >
            <Icon name="cart" color={colors.onAccent} size={22} />
            <View style={styles.cartText}>
              <Text
                variant="strong"
                color="onAccent"
                numberOfLines={1}
                maxFontSizeMultiplier={SCALE_MAX}
              >
                {actionLabel}
              </Text>
              <Text
                variant="caption"
                color="onAccent"
                numberOfLines={1}
                maxFontSizeMultiplier={SCALE_MAX}
              >
                {itemsLabel}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </>
  );
}
