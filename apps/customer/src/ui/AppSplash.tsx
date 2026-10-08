import { SplashScreen } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { palettes } from '@/theme';
import { LogoStacked } from './brand/Logo';
import { SPLASH_FADE_MS, splashMinimumMs, splashPhase } from './logic/splash';
import { Text } from './Text';
import { space } from './tokens';

export interface AppSplashProps {
  /** True once the saved theme and language are read. The app is drawn behind the splash from then on. */
  ready: boolean;
  /** The app. It is drawn as soon as it is ready, under the splash, so the fade reveals a finished screen. */
  children: ReactNode;
}

// The splash is the brand moment, so it is the same aubergine in both themes. Using the palette's
// light header colour (not the live theme) keeps it from flickering when the saved theme loads.
const SPLASH_BACKGROUND = palettes.light.chrome;

// The web preview has no native animation module; phones do, and run the fade on the UI thread.
const NATIVE_DRIVER = Platform.OS !== 'web';

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: {
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[5],
    padding: space[8],
  },
});

/** Do nothing if there is no native splash to hide (web, or a build without one). */
function hideNativeSplash() {
  SplashScreen.hideAsync().catch(() => undefined);
}

/**
 * The opening animation, then a fade into the app: the logo slides and fades in like a speed line,
 * the tagline follows, and the whole splash fades away once the app is ready and the logo has been
 * seen. With "reduce motion" on there is no movement, only a short cover while things load.
 */
export function AppSplash({ ready, children }: AppSplashProps) {
  const { t } = useLanguage();
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [gone, setGone] = useState(false);
  const [logo] = useState(() => new Animated.Value(0));
  const [tagline] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let current = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (current) setReduceMotion(enabled);
      })
      .catch(() => {
        if (current) setReduceMotion(false);
      });
    return () => {
      current = false;
    };
  }, []);

  // Start the clock and the entrance once we know whether to move.
  useEffect(() => {
    if (reduceMotion === null) return undefined;
    const timer = setTimeout(() => {
      setMinimumElapsed(true);
    }, splashMinimumMs(reduceMotion));
    if (reduceMotion) {
      logo.setValue(1);
    } else {
      Animated.timing(logo, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    }
    return () => {
      clearTimeout(timer);
    };
  }, [reduceMotion, logo]);

  // The tagline waits for the app to be ready, so it never changes language while it is on screen.
  useEffect(() => {
    if (reduceMotion === null || !ready) return;
    if (reduceMotion) {
      tagline.setValue(1);
      return;
    }
    Animated.timing(tagline, {
      toValue: 1,
      duration: 450,
      delay: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [reduceMotion, ready, tagline]);

  const phase = splashPhase({ appReady: ready, minimumElapsed });
  useEffect(() => {
    if (phase !== 'leaving' || reduceMotion === null) return;
    Animated.timing(fade, {
      toValue: 0,
      duration: reduceMotion ? 0 : SPLASH_FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: NATIVE_DRIVER,
    }).start(() => {
      setGone(true);
    });
  }, [phase, reduceMotion, fade]);

  const logoStyle = {
    opacity: logo,
    transform: [
      { translateX: logo.interpolate({ inputRange: [0, 1], outputRange: [-28, 0] }) },
      { scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
    ],
  };
  const taglineStyle = {
    opacity: tagline,
    transform: [{ translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
  };

  return (
    <View style={styles.root}>
      {/* Screen readers skip the app until the splash is gone. */}
      <View style={styles.root} aria-hidden={!gone}>
        {children}
      </View>
      {gone ? null : (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.splash, { opacity: fade }]}
          onLayout={hideNativeSplash}
        >
          <Animated.View style={logoStyle}>
            <LogoStacked width={220} ground="chrome" label={t('app.name')} />
          </Animated.View>
          <Animated.View style={taglineStyle}>
            {ready ? <Text color="onChromeMuted">{t('app.tagline')}</Text> : null}
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
