import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import SCOOTER from '../../assets/delivery-scooter.png';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  CartFloat,
  Icon,
  TAP_MIN,
  Text,
  Toast,
  radius,
  space,
  useChromeProgress,
  useReduceMotion,
  type CartThumb,
} from '@/ui';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';

/** About the height of the docked cart bar: how much room a page keeps under its last row while the bar shows. */
export const CART_ROOM = 104;
/** The cart bar's own height, so the toast can sit just above it. */
const CART_BAR = 96;
/** How high the collapsed note and button reach above the screen's bottom strip: their margin and their height. */
const COLLAPSED_ROOM = space[2] + TAP_MIN;
/** How many round pictures fit in the cart bar before the rest are folded into a "+N" bubble. */
const MAX_THUMBS = 3;

/**
 * How far a note that rests above the cart is moved from where `bottom` puts it (up is negative), so it sits right above whatever is
 * lowest: the full cart bar over the bottom bar, the small note and button once the bar is away, or the screen's bottom edge when the
 * cart is empty. The two cases are blended by the bottom bar's own hide progress, on the animation thread. Without `follow`
 * (a screen whose bar never hides) there is nothing to move.
 */
function useLiftAboveCart(follow: boolean): Animated.AnimatedNode | undefined {
  const cart = useCart();
  const reduceMotion = useReduceMotion();
  const hide = useChromeProgress();
  const filled = cart.count > 0;
  const [bar] = useState(() => new Animated.Value(filled ? 1 : 0));

  // 0 with an empty cart, 1 with something in it, eased so a note does not jump when the first item comes or the last one goes.
  useEffect(() => {
    if (!follow) return undefined;
    if (reduceMotion) {
      bar.setValue(filled ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(bar, {
      toValue: filled ? 1 : 0,
      duration: 220,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [follow, filled, reduceMotion, bar]);

  return follow
    ? Animated.multiply(
        Animated.add(
          Animated.multiply(
            Animated.multiply(bar, CART_BAR),
            hide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          ),
          Animated.multiply(
            hide,
            Animated.subtract(Animated.multiply(bar, COLLAPSED_ROOM), BOTTOM_BAR_HEIGHT),
          ),
        ),
        -1,
      )
    : undefined;
}

/**
 * The "removed, undo" note shown when the last unit of something leaves the cart. `bottom` is how far above the
 * screen's bottom edge the note's own bottom sits; `aboveBar` lifts it clear of the docked cart bar when that shows.
 */
export function UndoToast({
  bottom,
  aboveBar = false,
  follow = false,
}: {
  bottom: number;
  aboveBar?: boolean;
  /** The screen's bottom bar hides on scroll: the note then rests right above whatever is lowest (see `useLiftAboveCart`). */
  follow?: boolean;
}) {
  const { t } = useLanguage();
  const cart = useCart();
  const shift = useLiftAboveCart(follow);
  const filled = cart.count > 0;

  return (
    <Toast
      visible={cart.removed !== null}
      message={t('home.cart.removed', { name: cart.removed?.name ?? '' })}
      actionLabel={t('home.cart.undo')}
      onAction={cart.undoRemove}
      onTimeout={cart.clearRemoved}
      bottom={bottom + (aboveBar && !follow && filled ? CART_BAR : 0) + space[2]}
      {...(shift === undefined ? {} : { shift })}
    />
  );
}

const SHOWN_FOR_MS = 2800;

const makePopStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: space[3], right: space[3] },
    card: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingVertical: space[2],
      paddingLeft: space[2],
      paddingRight: space[4],
      borderRadius: radius.md,
      backgroundColor: c.chrome,
    },
    picture: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    scooter: { width: 40, height: 40 },
    tick: {
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
    // The small flecks that fly out of the picture when free delivery is reached.
    fleck: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
    text: { flex: 1, minWidth: 0 },
  });

/** The six directions the flecks fly in, as an angle in turns of the circle. */
const FLECKS = [0, 1, 2, 3, 4, 5].map((index) => (index / 6) * Math.PI * 2 + 0.3);
const FLY = 30;

/**
 * The moment the cart becomes worth free delivery: a note rises above the cart bar with the scooter, a pistachio tick and a few
 * flecks flying out of it, and goes by itself after a few seconds (or on a tap). It is only for the moment of crossing: opening the
 * app with a cart that was already free, or losing and regaining it, does not pretend nothing happened. With "reduce motion" on it
 * simply appears. The cart bar and its note say it too, for as long as it is true.
 */
function FreeDeliveryPop({
  bottom,
  aboveBar,
  follow,
}: {
  bottom: number;
  aboveBar: boolean;
  follow: boolean;
}) {
  const { t } = useLanguage();
  const cart = useCart();
  const styles = useStyles(makePopStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const lift = useLiftAboveCart(follow);
  const [visible, setVisible] = useState(false);
  const [show] = useState(() => new Animated.Value(0));
  const [burst] = useState(() => new Animated.Value(0));
  // Whether the cart was free at the last look. Only a change from "not free" to "free" while the cart is in use is a moment; the
  // cart coming back from the phone is not (it is read as free before `ready`, and then nothing changes).
  const [wasFree, setWasFree] = useState<boolean | null>(null);
  if (wasFree !== cart.free) {
    setWasFree(cart.free);
    if (cart.ready && wasFree === false && cart.free && cart.count > 0) setVisible(true);
    if (!cart.free && visible) setVisible(false);
  }

  useEffect(() => {
    if (!visible) {
      const out = Animated.timing(show, {
        toValue: 0,
        duration: reduceMotion ? 0 : 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      });
      out.start();
      return () => {
        out.stop();
      };
    }
    burst.setValue(0);
    const enter = reduceMotion
      ? Animated.timing(show, { toValue: 1, duration: 0, useNativeDriver: true })
      : Animated.parallel([
          Animated.spring(show, { toValue: 1, friction: 6, tension: 140, useNativeDriver: true }),
          Animated.timing(burst, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]);
    enter.start();
    const timer = setTimeout(() => {
      setVisible(false);
    }, SHOWN_FOR_MS);
    return () => {
      enter.stop();
      clearTimeout(timer);
    };
  }, [visible, reduceMotion, show, burst]);

  const filled = cart.count > 0;

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      aria-hidden={!visible}
      style={[
        styles.wrap,
        {
          bottom: bottom + (aboveBar && !follow && filled ? CART_BAR : 0) + space[2],
          opacity: show,
          transform: [
            ...(lift === undefined ? [] : [{ translateY: lift }]),
            { translateY: show.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
            { scale: show.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      <Pressable
        role="status"
        aria-live="polite"
        aria-label={`${t('home.cart.freeUnlockedTitle')}. ${t('home.cart.freeUnlockedBody')}`}
        onPress={() => {
          setVisible(false);
        }}
        style={styles.card}
      >
        <View style={styles.picture} aria-hidden>
          {FLECKS.map((angle, index) => (
            <Animated.View
              key={index}
              pointerEvents="none"
              style={[
                styles.fleck,
                {
                  opacity: burst.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
                  transform: [
                    {
                      translateX: burst.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.cos(angle) * FLY],
                      }),
                    },
                    {
                      translateY: burst.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin(angle) * FLY],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
          <Image source={SCOOTER} resizeMode="contain" style={styles.scooter} />
          <View style={styles.tick}>
            <Icon name="check" color={colors.onAccent} size={12} />
          </View>
        </View>
        <View style={styles.text}>
          <Text variant="strong" color="accent" numberOfLines={1}>
            {t('home.cart.freeUnlockedTitle')}
          </Text>
          <Text variant="caption" color="onChromeMuted" numberOfLines={2}>
            {t('home.cart.freeUnlockedBody')}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Everything the cart puts on a screen that is not the cart itself: the docked cart bar and the undo toast. The bar
 * opens the cart page. A screen places it once and says how far above its own bottom the bar docks (above the tab bar
 * on Home, at the phone's bottom edge on a shop page).
 */
export function CartLayer({ bottom, follow = false }: { bottom: number; follow?: boolean }) {
  const { t } = useLanguage();
  const cart = useCart();
  const tintOf = useTintOf();
  const router = useRouter();

  const room = cart.lines.length > MAX_THUMBS ? MAX_THUMBS - 1 : cart.lines.length;
  const thumbs: CartThumb[] = cart.lines
    .slice(0, room)
    .map((line) => ({ key: line.id, emoji: line.emoji, tint: tintOf(line.category) }));
  const moreCount = cart.lines.length - room;

  return (
    <>
      <CartFloat
        visible={cart.count > 0}
        thumbs={thumbs}
        {...(moreCount > 0 ? { moreLabel: `+${moreCount}` } : {})}
        itemsLabel={cart.itemsLabel}
        totalLabel={cart.totalLabel}
        shopLabel={cart.shopLabel}
        {...(cart.savedLabel !== undefined ? { savedLabel: cart.savedLabel } : {})}
        hint={cart.hint}
        progress={cart.progress}
        free={cart.free}
        pillTitle={cart.pill.title}
        pillSub={cart.pill.sub}
        actionLabel={t('home.cart.view')}
        onPress={() => {
          router.push('/cart');
        }}
        bottom={bottom}
        follow={follow}
      />
      <UndoToast bottom={bottom} aboveBar follow={follow} />
      <FreeDeliveryPop bottom={bottom} aboveBar follow={follow} />
    </>
  );
}
