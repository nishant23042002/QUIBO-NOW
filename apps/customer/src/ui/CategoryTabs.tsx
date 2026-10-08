import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text as NativeText,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface CategoryTab {
  key: string;
  /** Already translated. */
  label: string;
  /** The picture on the tab: one emoji, drawn by the phone. */
  emoji: string;
}

export interface CategoryTabsProps {
  tabs: readonly CategoryTab[];
  selectedKey: string;
  onSelect: (key: string) => void;
  /** Names the row for a screen reader, for example "Categories". */
  label: string;
}

interface Place {
  x: number;
  width: number;
}

const TAB_PADDING = space[3];
const UNDERLINE = 3;
const EMOJI_BOX = 44;
const SLIDE_MS = 280;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { paddingHorizontal: space[4] - TAB_PADDING },
    // The tabs and the underline share this box, so the underline can be placed by the tabs' own positions.
    tabs: { flexDirection: 'row' },
    tab: {
      minWidth: 72,
      alignItems: 'center',
      gap: space[1],
      paddingHorizontal: TAB_PADDING,
      paddingTop: space[2],
      paddingBottom: space[3],
    },
    pressed: { opacity: 0.7 },
    dimmed: { opacity: 0.75 },
    // A fixed box, so the tabs keep one height whatever the phone's emoji set looks like.
    emoji: { width: EMOJI_BOX, height: EMOJI_BOX, alignItems: 'center', justifyContent: 'center' },
    emojiText: { fontSize: 28, lineHeight: 34, textAlign: 'center' },
    underline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: UNDERLINE,
      borderTopLeftRadius: UNDERLINE,
      borderTopRightRadius: UNDERLINE,
      backgroundColor: c.onHeader,
    },
  });

/**
 * The row of category tabs on the home header: an icon over a name, the chosen one in full colour with an
 * underline that slides to it. The row scrolls sideways when the tabs do not fit, and scrolls the chosen tab
 * into view. The colours are the header's, so it sits on whatever tint the header has taken.
 */
export function CategoryTabs({ tabs, selectedKey, onSelect, label }: CategoryTabsProps) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const scroller = useRef<ScrollView>(null);
  const [places, setPlaces] = useState<Record<string, Place>>({});
  const [viewWidth, setViewWidth] = useState(0);
  const [left] = useState(() => new Animated.Value(0));
  const [width] = useState(() => new Animated.Value(0));
  // Whether the underline has been put on its first tab yet; later changes slide it instead.
  const placed = useRef(false);
  const place = places[selectedKey];

  const measure = (key: string) => (event: LayoutChangeEvent) => {
    const { x, width: tabWidth } = event.nativeEvent.layout;
    setPlaces((current) => {
      const known = current[key];
      return known?.x === x && known.width === tabWidth
        ? current
        : { ...current, [key]: { x, width: tabWidth } };
    });
  };

  useEffect(() => {
    if (place === undefined) return undefined;
    if (!placed.current || reduceMotion) {
      left.setValue(place.x);
      width.setValue(place.width);
      placed.current = true;
    } else {
      const slide = Animated.parallel([
        Animated.timing(left, {
          toValue: place.x,
          duration: SLIDE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(width, {
          toValue: place.width,
          duration: SLIDE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]);
      slide.start();
      return () => {
        slide.stop();
      };
    }
    return undefined;
  }, [place, reduceMotion, left, width]);

  // Bring the chosen tab to the middle of the row when the row is wider than the screen.
  useEffect(() => {
    if (place === undefined || viewWidth === 0) return;
    scroller.current?.scrollTo({
      x: Math.max(0, place.x - (viewWidth - place.width) / 2),
      animated: !reduceMotion,
    });
  }, [place, viewWidth, reduceMotion]);

  return (
    <ScrollView
      ref={scroller}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      onLayout={(event) => {
        setViewWidth(event.nativeEvent.layout.width);
      }}
      role="tablist"
      aria-label={label}
    >
      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const selected = tab.key === selectedKey;
          return (
            <Pressable
              key={tab.key}
              role="tab"
              aria-selected={selected}
              aria-label={tab.label}
              onLayout={measure(tab.key)}
              onPress={() => {
                onSelect(tab.key);
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              {/* The emoji keeps its colours on an unchosen tab; it is only softened, not greyed. */}
              <View style={[styles.emoji, selected ? undefined : styles.dimmed]} aria-hidden>
                <NativeText allowFontScaling={false} style={styles.emojiText}>
                  {tab.emoji}
                </NativeText>
              </View>
              <Text
                variant="strong"
                color={selected ? 'onHeader' : 'onHeaderMuted'}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
        <Animated.View style={[styles.underline, { width, transform: [{ translateX: left }] }]} />
      </View>
    </ScrollView>
  );
}
