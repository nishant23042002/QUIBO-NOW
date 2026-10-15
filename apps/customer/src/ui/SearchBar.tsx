import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { fontSize, leading, radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** A hint with a fixed part and a changing part, for example Search “milk”. */
export interface SearchHint {
  /** Always shown, still, before the changing word: "Search". The quotes around the word are added here. */
  label: string;
  /** The words that take turns: each slides up and fades out as the next slides up and fades in. */
  words: readonly string[];
}

export interface SearchBarProps {
  /** The bar's name for a screen reader, and its hint when `hint` is not given. Pass a translated string. */
  placeholder: string;
  /** Give a handler and the bar is a button that opens the search screen. */
  onPress?: () => void;
  /** With a button bar: the fixed word stays still while the example words take turns beside it. */
  hint?: SearchHint;
  /** Give these and the bar is a real text field. */
  value?: string;
  onChangeText?: (text: string) => void;
  /**
   * A second button inside the bar, at its right, behind a fine divider: Home puts "Schedule a slot" here, so choosing a window is
   * one tap from the first screen. Only a button bar (with `onPress`) has one.
   */
  slot?: { label: string; onPress: () => void };
}

/** Compact: the field is 44 dp tall, and its touch area is made up to 48 with a little slop above and below. */
const BAR_HEIGHT = 44;
/** How long an example stays, and how long the slide to the next one takes. */
const HOLD_MS = 2200;
const SLIDE_MS = 380;
/** How far a word travels as it slides in and out. It is small on purpose: a nudge up, not a swipe. */
const TRAVEL = 12;
const OPEN_QUOTE = '“';
const CLOSE_QUOTE = '”';
/** The phone's own animation thread does the sliding on a phone; the web preview has none. */
const NATIVE_DRIVER = Platform.OS !== 'web';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bar: {
      minHeight: BAR_HEIGHT,
      paddingHorizontal: space[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
    input: { flex: 1, paddingVertical: space[1], fontSize: fontSize.sm, color: c.ink },
    hint: { flex: 1, minWidth: 0, justifyContent: 'center' },
    hintRow: { flexDirection: 'row', alignItems: 'center' },
    label: { flexShrink: 0, paddingRight: space[1] },
    // The window the example words slide through. It is one line tall, and the two words sit on top of each other inside it.
    slide: { flex: 1, minWidth: 0 },
    word: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center' },
    // With a slot, the bar is a row of two buttons: the search itself, a fine divider, and the slot.
    main: {
      flex: 1,
      minWidth: 0,
      minHeight: BAR_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
    },
    divider: { width: 1, alignSelf: 'stretch', marginVertical: space[2], backgroundColor: c.line },
    slot: {
      flexShrink: 0,
      maxWidth: 140,
      minHeight: BAR_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      paddingLeft: space[2],
    },
    slotText: { flexShrink: 1 },
  });

/**
 * Two example words take turns in one line. Each sits in a slot: where 0 is in place, -1 is a nudge above (and gone) and 1 a nudge
 * below (and gone). To change word, the one in place slides up and fades out while the next slides up from below and fades in; the
 * slot that left is then moved below, out of sight, and given the word after. Nothing is typed, and nothing else in the bar moves.
 */
function useTakingTurns(words: readonly string[], enabled: boolean) {
  // The words are compared by value, so a new array with the same words does not restart the turns.
  const key = words.join('\u0000');
  const count = key === '' ? 0 : key.split('\u0000').length;
  const [slotWords, setSlotWords] = useState<readonly [number, number]>([0, count > 1 ? 1 : 0]);
  const [front, setFront] = useState<0 | 1>(0);
  const [positions] = useState(() => [new Animated.Value(0), new Animated.Value(1)] as const);

  useEffect(() => {
    if (!enabled || count < 2) return undefined;
    const back = front === 0 ? 1 : 0;
    const timer = setTimeout(() => {
      const move = Animated.parallel([
        Animated.timing(positions[front], {
          toValue: -1,
          duration: SLIDE_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(positions[back], {
          toValue: 0,
          duration: SLIDE_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: NATIVE_DRIVER,
        }),
      ]);
      move.start(({ finished }) => {
        if (!finished) return;
        // The slot that left is out of sight above: put it below, out of sight, with the word after the one now showing.
        positions[front].setValue(1);
        setSlotWords((words) => {
          const next: [number, number] = [words[0], words[1]];
          next[front] = (words[back] + 1) % count;
          return next;
        });
        setFront(back);
      });
    }, HOLD_MS);
    return () => {
      clearTimeout(timer);
      positions[0].stopAnimation();
      positions[1].stopAnimation();
    };
  }, [enabled, count, front, positions]);

  return { slotWords, positions };
}

function TakingTurnsHint({ hint }: { hint: SearchHint }) {
  const styles = useStyles(makeStyles);
  const { locale } = useLanguage();
  const reduceMotion = useReduceMotion();
  const animated = !reduceMotion && hint.words.length > 1;
  const { slotWords, positions } = useTakingTurns(hint.words, animated);
  // One line of the hint's text style, so the window the words slide through is as tall as the text.
  const line = Math.round(fontSize.sm * leading[locale === 'en' ? 'latin' : 'devanagari'].normal);
  const quoted = (index: number): string => `${OPEN_QUOTE}${hint.words[index] ?? ''}${CLOSE_QUOTE}`;

  return (
    <View style={styles.hint} aria-hidden>
      <View style={styles.hintRow}>
        <View style={styles.label}>
          <Text variant="small" color="inkMuted" numberOfLines={1}>
            {hint.label}
          </Text>
        </View>
        <View style={[styles.slide, { height: line }]}>
          {animated ? (
            positions.map((position, slot) => (
              <Animated.View
                key={slot}
                style={[
                  styles.word,
                  {
                    opacity: position.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [0, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: position.interpolate({
                          inputRange: [-1, 0, 1],
                          outputRange: [-TRAVEL, 0, TRAVEL],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text variant="small" color="inkMuted" numberOfLines={1}>
                  {quoted(slotWords[slot === 0 ? 0 : 1])}
                </Text>
              </Animated.View>
            ))
          ) : (
            <View style={styles.word}>
              <Text variant="small" color="inkMuted" numberOfLines={1}>
                {quoted(0)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * The search bar at the top of Home and of a shop. It is always a light field (the surface colour with a hairline edge), so it reads
 * on the tinted header in both themes. As a button it shows "Search" and, beside it, a few example searches that take turns, each
 * sliding up and fading as the next one comes in, which also teaches people they can type "dudh" or "atta". With "reduce motion" on
 * it shows the first example, still.
 */
export function SearchBar({
  placeholder,
  onPress,
  hint,
  value,
  onChangeText,
  slot,
}: SearchBarProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const icon = <Icon name="search" color={colors.inkMuted} size={20} />;

  if (onChangeText !== undefined) {
    return (
      <View style={styles.bar}>
        {icon}
        <TextInput
          role="searchbox"
          aria-label={placeholder}
          placeholder={placeholder}
          placeholderTextColor={colors.inkMuted}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
        />
      </View>
    );
  }

  const field =
    hint !== undefined ? (
      // With the words changed (the language), the hint is made again, so it starts from the first.
      <TakingTurnsHint key={hint.words.join('\u0000')} hint={hint} />
    ) : (
      <View style={styles.hint}>
        <Text variant="small" color="inkMuted" numberOfLines={1}>
          {placeholder}
        </Text>
      </View>
    );

  if (slot !== undefined) {
    return (
      <View style={styles.bar}>
        <Pressable
          role="button"
          aria-label={placeholder}
          onPress={onPress}
          style={({ pressed }) => [styles.main, pressed && styles.pressed]}
        >
          {icon}
          {field}
        </Pressable>
        <View style={styles.divider} aria-hidden />
        <Pressable
          role="button"
          aria-label={slot.label}
          onPress={slot.onPress}
          style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
        >
          <Icon name="calendar" color={colors.ink} size={20} />
          <View style={styles.slotText}>
            <Text variant="caption" numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {slot.label}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      role="button"
      aria-label={placeholder}
      onPress={onPress}
      hitSlop={{ top: 2, bottom: 2 }}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      {icon}
      {field}
    </Pressable>
  );
}
