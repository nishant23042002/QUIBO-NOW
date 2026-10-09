import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import type { Order } from '@quibo/contracts';
import { useLanguage } from '@/i18n/LanguageProvider';
import { palettes } from '@/theme';
import { Icon, Text, radius, space, useReduceMotion } from '@/ui';
import { orderNumber } from './ids';
import { PLACED_FADE_MS, PLACED_MS, PLACED_REDUCED_MS } from './timing';

// Like the opening splash and the welcome, a brand moment: the same aubergine in both themes.
const BACKGROUND = palettes.light.chrome;
const NATIVE_DRIVER = Platform.OS !== 'web';
const BADGE = 88;

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
  badge: {
    width: BADGE,
    height: BADGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palettes.light.accent,
  },
  words: { alignItems: 'center', gap: space[1] },
});

/**
 * Shown over the app the moment an order is placed: a check mark comes in, it says the order is placed and its number, and then it
 * fades away onto the Orders tab. The tab is opened under it while the screen is still solid, so nothing flashes. With "reduce
 * motion" on it only covers the change of screen and does not move.
 */
export function OrderPlaced({ order, onDone }: { order: Order; onDone: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const [enter] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const total = reduceMotion ? PLACED_REDUCED_MS : PLACED_MS;
    const duration = reduceMotion ? 0 : 240;
    if (reduceMotion) enter.setValue(1);
    else {
      Animated.timing(enter, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    }
    // Cover the page first, then open the Orders tab underneath once the cover is solid, then fade the cover away.
    Animated.timing(fade, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
    const open = setTimeout(
      () => {
        // The list goes under the order's page, so "back" from the page is the list.
        router.navigate('/orders');
        router.push({ pathname: '/order', params: { id: order.id } });
      },
      reduceMotion ? 0 : 300,
    );
    const leave = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: reduceMotion ? 0 : PLACED_FADE_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, total);
    return () => {
      clearTimeout(open);
      clearTimeout(leave);
    };
  }, [reduceMotion, enter, fade, router, onDone, order.id]);

  const pop = {
    opacity: enter,
    transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
  };

  return (
    <Animated.View
      style={[styles.root, { opacity: fade }]}
      accessible
      aria-label={`${t('placed.title')}. ${t('placed.number', { number: orderNumber(order.id) })}`}
      role="alert"
    >
      <Animated.View style={[styles.badge, pop]}>
        <Icon name="check" color={palettes.light.chrome} size={44} />
      </Animated.View>
      <View style={styles.words}>
        <Text variant="heading" color="onChrome" align="center">
          {t('placed.title')}
        </Text>
        <Text color="onChromeMuted" align="center">
          {t('placed.number', { number: orderNumber(order.id) })}
        </Text>
        <Text color="onChromeMuted" align="center">
          {t('placed.body')}
        </Text>
      </View>
    </Animated.View>
  );
}
