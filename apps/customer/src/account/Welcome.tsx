import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { palettes } from '@/theme';
import { LogoStacked, Text, space, useReduceMotion } from '@/ui';
import { WELCOME_FADE_MS, WELCOME_MS, WELCOME_REDUCED_MS } from './timing';

// Like the opening splash, the welcome is a brand moment: the same aubergine in both themes.
const BACKGROUND = palettes.light.chrome;
const NATIVE_DRIVER = Platform.OS !== 'web';
const BAR_WIDTH = 160;

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
  words: { alignItems: 'center', gap: space[1] },
  track: {
    width: BAR_WIDTH,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: palettes.light.onChromeMuted,
    opacity: 0.9,
  },
  fill: { width: BAR_WIDTH, height: 4, backgroundColor: palettes.light.accent },
});

/**
 * Shown over Home the moment the code is right, so the shopper is never dropped onto a page that is still drawing itself. The
 * logo comes in, a line says the shopper is in, and a thin bar fills while Home loads underneath; then the whole screen fades
 * away onto the finished page. With "reduce motion" on it only covers Home for a moment and fades without moving.
 */
export function Welcome({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const reduceMotion = useReduceMotion();
  const [enter] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const total = reduceMotion ? WELCOME_REDUCED_MS : WELCOME_MS;
    if (reduceMotion) {
      enter.setValue(1);
      progress.setValue(1);
    } else {
      Animated.timing(enter, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }).start();
      Animated.timing(progress, {
        toValue: 1,
        duration: total,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    }
    const leave = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: reduceMotion ? 0 : WELCOME_FADE_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, total);
    return () => {
      clearTimeout(leave);
    };
  }, [reduceMotion, enter, progress, fade, onDone]);

  const rise = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
    ],
  };

  return (
    <Animated.View
      style={[styles.root, { opacity: fade }]}
      accessible
      aria-label={t('firstRun.welcome')}
      role="alert"
    >
      <Animated.View style={rise}>
        <LogoStacked width={180} ground="chrome" label={t('app.name')} />
      </Animated.View>
      <Animated.View style={[styles.words, { opacity: enter }]}>
        <Text variant="subheading" color="onChrome" align="center">
          {t('firstRun.welcome')}
        </Text>
        <Text color="onChromeMuted" align="center">
          {t('firstRun.welcomeBody')}
        </Text>
      </Animated.View>
      <View style={styles.track} aria-hidden>
        <Animated.View
          style={[
            styles.fill,
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-BAR_WIDTH, 0],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}
