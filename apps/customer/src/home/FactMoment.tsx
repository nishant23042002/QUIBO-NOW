import { usePathname } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Text as NativeText,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Text, radius, space, useReduceMotion } from '@/ui';
import { useConditions } from './conditions';
import { lastMomentAt, markMoment } from './momentClock';
import { FACT_MS, momentFact, shouldShowFact } from './momentRules';
import { useSampleShops } from './sampleShops';

const NATIVE_DRIVER = Platform.OS !== 'web';
const BADGE = 136;
/** The card eases in over the incoming screen, and eases out to the finished page. */
const FADE_IN_MS = 200;
const FADE_OUT_MS = 320;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 50,
      backgroundColor: c.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      padding: space[8],
      gap: space[5],
    },
    badge: {
      width: BADGE,
      height: BADGE,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderBottomWidth: 6,
      borderRightWidth: 6,
      borderColor: c.accentEdge,
    },
    words: { alignItems: 'center', gap: space[2], maxWidth: 320 },
  });

/**
 * Whether a screen reader is on: someone using one is not put through an interstitial. The web cannot tell (it always answers yes),
 * so there it is taken as off.
 */
function useScreenReader(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    let live = true;
    void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (live) setOn(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setOn);
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return on;
}

/**
 * The "why Quibo" moment between screens (ADR 0055, step 11): one true thing about how Quibo works, for about a second and a half,
 * on the first screen opened and then on every third, never twice within 20 seconds and never in front of a task screen (see
 * `shouldShowFact`). A tap closes it. It is not shown to anyone who asked the phone for less motion or uses a screen reader, in a
 * town served by one dark store (the facts are about partner shops), and there is no progress line: nothing counts down.
 */
export function FactMoment() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const pathname = usePathname();
  const reduceMotion = useReduceMotion();
  const screenReader = useScreenReader();
  const { store } = useConditions();
  const shops = useSampleShops();
  const opened = useRef(0);
  const lastPath = useRef<string | null>(null);
  const round = useRef(0);
  const [shown, setShown] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [fade] = useState(() => new Animated.Value(0));

  // Each new screen is counted once, and may open a fact. This runs before the new screen is first drawn, so the card is in front
  // of it from the first frame and the shopper never sees its skeleton flash up and then get covered.
  useLayoutEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    opened.current += 1;
    const show = shouldShowFact({
      count: opened.current,
      now: Date.now(),
      last: lastMomentAt(),
      pathname,
      quiet: reduceMotion || screenReader || store !== 'partner',
    });
    if (!show) return;
    markMoment();
    const index = round.current;
    round.current += 1;
    fade.stopAnimation();
    fade.setValue(0);
    setLeaving(false);
    setShown(index);
  }, [pathname, reduceMotion, screenReader, store, fade]);

  // It fades in, stays a moment, and fades out by itself: the screen under it has finished loading by then, so the card gives way to
  // a finished page and not to a skeleton, and never cuts off.
  useEffect(() => {
    if (shown === null) return undefined;
    Animated.timing(fade, {
      toValue: 1,
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
    const timer = setTimeout(() => {
      setLeaving(true);
    }, FACT_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [shown, fade]);

  // Closing (by itself or with a tap) is a fade, then the card is gone.
  useEffect(() => {
    if (!leaving) return;
    Animated.timing(fade, {
      toValue: 0,
      duration: FADE_OUT_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) setShown(null);
    });
  }, [leaving, fade]);

  if (shown === null) return null;
  const fact = momentFact(shown);
  const shop = shops.find((candidate) => candidate.open) ?? shops[0];
  const title = t(`moment.fact.${fact.id}.title`);
  const body = t(`moment.fact.${fact.id}.body`, {
    shop: shop?.name ?? '',
    year: shop?.since ?? '',
  });

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <Pressable
        accessible={false}
        onPress={() => {
          setLeaving(true);
        }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.badge} aria-hidden pointerEvents="none">
        <NativeText allowFontScaling={false} style={{ fontSize: 66, lineHeight: 80 }}>
          {fact.emoji}
        </NativeText>
      </View>
      <View style={styles.words} pointerEvents="none">
        <Text variant="caption" color="accentInk">
          {t('moment.kicker')}
        </Text>
        <Text variant="hero" align="center" role="heading">
          {title}
        </Text>
        <Text align="center" color="inkMuted">
          {body}
        </Text>
      </View>
      <View pointerEvents="none">
        <Text variant="small" color="inkMuted">
          {t('moment.skip')}
        </Text>
      </View>
    </Animated.View>
  );
}
