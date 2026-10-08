import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Text as NativeText,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text, type TextColor } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** The four looks a promo can have, each a pair of colours that is checked for contrast. */
export type PromoTone = 'brand' | 'pistachio' | 'mango' | 'light';

export interface PromoSlide {
  id: string;
  /** The offer in a few words. Up to two lines. */
  title: string;
  /** One short line of detail. Never promise minutes; a delivery window is fine. */
  body: string;
  /** One emoji, drawn on the right. */
  emoji: string;
  tone: PromoTone;
}

export interface PromoCarouselProps {
  slides: readonly PromoSlide[];
  /** Names the row of offers for a screen reader, for example "Offers". */
  label: string;
  onPress: (id: string) => void;
}

const GAP = space[3];
/**
 * The space on each side of a card. Cards are centred, so the same space shows on the left and the right of
 * whichever card is in front, and the cards on either side peek in by this much minus the gap.
 */
const SIDE = space[8] - space[1];
const CARD_HEIGHT = 104;
const AUTO_MS = 4200;
/** After a person touches the row, it waits this long before sliding on its own again. */
const IDLE_MS = 7000;
const DOT = 6;
const DOT_ACTIVE = 18;

interface ToneLook {
  background: keyof ThemeColors;
  title: TextColor;
  body: TextColor;
}

const TONES: Record<PromoTone, ToneLook> = {
  brand: { background: 'chrome', title: 'onChrome', body: 'onChromeMuted' },
  pistachio: { background: 'accent', title: 'onAccent', body: 'onAccent' },
  mango: { background: 'tagBg', title: 'tagFg', body: 'tagFg' },
  light: { background: 'headerControl', title: 'onHeaderControl', body: 'onHeaderControl' },
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { paddingHorizontal: SIDE, gap: GAP },
    card: {
      height: CARD_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderRadius: radius.lg,
    },
    pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
    text: { flex: 1, minWidth: 0, gap: 2 },
    emoji: { fontSize: 40, lineHeight: 48, textAlign: 'center', width: 56 },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      marginTop: space[2],
    },
    dot: { height: DOT, borderRadius: DOT, backgroundColor: c.onHeader },
  });

/**
 * A row of offers that slides on its own, one card at a time. The card in front is centred, with the same
 * space on both sides and its neighbours peeking in, and a dot for each card sits underneath. A swipe takes over, and the row waits a few seconds before sliding again.
 * With the phone's "reduce motion" setting on it never slides by itself. It is built for the home header,
 * so the dots take the header's ink colour.
 */
export function PromoCarousel({ slides, label, onPress }: PromoCarouselProps) {
  const styles = useStyles(makeStyles);
  const { width: screen } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const scroller = useRef<ScrollView>(null);
  const lastTouch = useRef(0);
  const page = useRef(0);
  const [scrollX] = useState(() => new Animated.Value(0));
  const cardWidth = screen - SIDE * 2;
  const step = cardWidth + GAP;
  const count = slides.length;

  // Which card is showing, kept for the automatic slide (so it knows which one comes next).
  useEffect(() => {
    const id = scrollX.addListener(({ value }) => {
      page.current = Math.round(value / step);
    });
    return () => {
      scrollX.removeListener(id);
    };
  }, [scrollX, step]);

  useEffect(() => {
    if (reduceMotion || count < 2) return undefined;
    const timer = setInterval(() => {
      if (Date.now() - lastTouch.current < IDLE_MS) return;
      const next = (page.current + 1) % count;
      scroller.current?.scrollTo({ x: next * step, animated: true });
    }, AUTO_MS);
    return () => {
      clearInterval(timer);
    };
  }, [reduceMotion, count, step]);

  const touched = () => {
    lastTouch.current = Date.now();
  };

  return (
    <View role="list" aria-label={label}>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        snapToAlignment="start"
        contentContainerStyle={styles.row}
        scrollEventThrottle={16}
        onScrollBeginDrag={touched}
        onMomentumScrollEnd={touched}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
      >
        {slides.map((slide) => (
          <PromoCard key={slide.id} slide={slide} width={cardWidth} onPress={onPress} />
        ))}
      </ScrollView>
      <View style={styles.dots} aria-hidden>
        {slides.map((slide, index) => (
          <Animated.View
            key={slide.id}
            style={[
              styles.dot,
              {
                width: scrollX.interpolate({
                  inputRange: [(index - 1) * step, index * step, (index + 1) * step],
                  outputRange: [DOT, DOT_ACTIVE, DOT],
                  extrapolate: 'clamp',
                }),
                opacity: scrollX.interpolate({
                  inputRange: [(index - 1) * step, index * step, (index + 1) * step],
                  outputRange: [0.4, 1, 0.4],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

interface PromoCardProps {
  slide: PromoSlide;
  width: number;
  onPress: (id: string) => void;
}

function PromoCard({ slide, width, onPress }: PromoCardProps) {
  const styles = useStyles(makeStyles);
  const look = TONES[slide.tone];
  const { colors } = useTheme();

  return (
    <Pressable
      role="listitem"
      aria-label={`${slide.title}. ${slide.body}`}
      onPress={() => {
        onPress(slide.id);
      }}
      style={({ pressed }) => [
        styles.card,
        { width, backgroundColor: colors[look.background] },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.text}>
        <Text variant="label" color={look.title} numberOfLines={2}>
          {slide.title}
        </Text>
        <Text variant="small" color={look.body} numberOfLines={1}>
          {slide.body}
        </Text>
      </View>
      <NativeText allowFontScaling={false} style={styles.emoji} aria-hidden>
        {slide.emoji}
      </NativeText>
    </Pressable>
  );
}
