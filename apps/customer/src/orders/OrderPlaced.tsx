import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { Order } from '@quibo/contracts';
import { markMoment } from '@/home/momentClock';
import { useLanguage } from '@/i18n/LanguageProvider';
import { palettes } from '@/theme';
import { Text, radius, space, useReduceMotion } from '@/ui';
import { orderNumber } from './ids';
import { PLACED_FADE_MS, PLACED_MS, PLACED_REDUCED_MS } from './timing';

// Like the opening splash and the welcome, a brand moment: the same pistachio in both themes.
const BACKGROUND = palettes.light.accent;
const NATIVE_DRIVER = Platform.OS !== 'web';
const AVATAR = 56;
/** The most shop avatars shown side by side; the heading and the line below still name all of them. */
const AVATARS_MAX = 3;
/** The avatars' colours, in turn: shop tints from the palette. */
const AVATAR_TINTS = [
  palettes.light.tintStaples,
  palettes.light.tintVegetables,
  palettes.light.tintDairy,
] as const;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[5],
    padding: space[8],
  },
  avatars: { flexDirection: 'row', justifyContent: 'center' },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: palettes.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlap: { marginLeft: -14 },
  words: { alignItems: 'center', gap: space[2], maxWidth: 340 },
});

/** The first letter of a shop's name, as one character even for a name in Devanagari. */
function initialOf(name: string): string {
  return [...name.trim()][0] ?? '';
}

/**
 * Shown over the app the moment an order is placed (ADR 0055, step 11): the shops the order is with, by name, and that one rider will
 * bring one bag with their names on it. It opens the order's page underneath while the screen is still solid, then fades away onto
 * it by itself, or at a tap. Nothing counts down. With "reduce motion" on it only covers the change of screen and does not move.
 */
export function OrderPlaced({ order, onDone }: { order: Order; onDone: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const [enter] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(0));
  const opened = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // The list goes under the order's page, so "back" from the page is the list.
  const open = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    router.navigate('/orders');
    router.push({ pathname: '/order', params: { id: order.id } });
  }, [router, order.id]);

  const leave = useCallback(() => {
    open();
    Animated.timing(fade, {
      toValue: 0,
      duration: reduceMotion ? 0 : PLACED_FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [open, fade, reduceMotion, onDone]);

  useEffect(() => {
    // A moment screen has begun: no fact comes up for a while after it.
    markMoment();
    const total = reduceMotion ? PLACED_REDUCED_MS : PLACED_MS;
    if (reduceMotion) enter.setValue(1);
    else {
      Animated.timing(enter, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    }
    // Cover the page first, then open the order underneath once the cover is solid, then fade the cover away.
    Animated.timing(fade, {
      toValue: 1,
      duration: reduceMotion ? 0 : 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
    const waiting = timers.current;
    waiting.push(setTimeout(open, reduceMotion ? 0 : 300));
    waiting.push(setTimeout(leave, total));
    return () => {
      waiting.forEach(clearTimeout);
    };
  }, [reduceMotion, enter, fade, open, leave]);

  const pop = {
    opacity: enter,
    transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
  };
  const names = order.shops.map((shop) => shop.name).join(', ');
  const many = order.shops.length > 1;
  const heading = many ? t('placed.withMany', { count: order.shops.length }) : t('placed.withOne');
  const packing = many ? t('placed.packingMany', { names }) : t('placed.packingOne', { names });

  return (
    <Animated.View
      style={[styles.root, { opacity: fade }]}
      accessible
      aria-label={`${t('placed.title')}. ${heading}. ${packing}`}
      role="alert"
    >
      {/* A tap anywhere moves on at once. */}
      <Pressable
        accessible={false}
        onPress={() => {
          waitingClear(timers.current);
          leave();
        }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.avatars, pop]} aria-hidden pointerEvents="none">
        {order.shops.slice(0, AVATARS_MAX).map((shop, index) => (
          <View
            key={shop.id}
            style={[
              styles.avatar,
              index > 0 && styles.overlap,
              { backgroundColor: AVATAR_TINTS[index % AVATAR_TINTS.length] },
            ]}
          >
            <Text variant="subheading" color="ink">
              {initialOf(shop.name)}
            </Text>
          </View>
        ))}
      </Animated.View>
      <View style={styles.words} pointerEvents="none">
        <Text variant="caption" color="onAccent">
          {t('placed.title')}
        </Text>
        <Text variant="hero" color="onAccent" align="center" role="heading">
          {heading}
        </Text>
        <Text color="onAccent" align="center">
          {packing}
        </Text>
        <Text variant="small" color="onAccent" align="center">
          {t('placed.number', { number: orderNumber(order.id) })}
        </Text>
      </View>
      <View pointerEvents="none">
        <Text variant="small" color="onAccent">
          {t('placed.continue')}
        </Text>
      </View>
    </Animated.View>
  );
}

/** Stops the waiting timers, so a tap does not also run what they were waiting to do. */
function waitingClear(timers: ReturnType<typeof setTimeout>[]): void {
  timers.forEach(clearTimeout);
  timers.length = 0;
}
