import { useEffect, useState } from 'react';
import { Pressable, Text as NativeText, StyleSheet, TextInput, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { fontSize, radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** A hint with a fixed part and a changing part, for example Search “milk”. */
export interface SearchHint {
  /** Always shown, before the changing word: "Search". The quotes around the word are added here. */
  label: string;
  /** The words that type themselves in, one after another. */
  words: readonly string[];
}

export interface SearchBarProps {
  /** The bar's name for a screen reader, and its hint when `hint` is not given. Pass a translated string. */
  placeholder: string;
  /** Give a handler and the bar is a button that opens the search screen. */
  onPress?: () => void;
  /** With a button bar: the fixed words stay still while the changing word types and erases itself. */
  hint?: SearchHint;
  /** Give these and the bar is a real text field. */
  value?: string;
  onChangeText?: (text: string) => void;
}

const BAR_HEIGHT = 52;
/** How long each step takes, in milliseconds. */
const TYPE_MS = 85;
const ERASE_MS = 40;
const HOLD_MS = 1500;
const GAP_MS = 350;
const CARET_MS = 480;
const OPEN_QUOTE = '\u201C';
const CLOSE_QUOTE = '\u201D';
const CARET = '|';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bar: {
      minHeight: BAR_HEIGHT,
      paddingHorizontal: space[4],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
    input: { flex: 1, paddingVertical: space[2], fontSize: fontSize.base, color: c.ink },
    hint: { flex: 1, minWidth: 0, justifyContent: 'center' },
  });

/**
 * The word being typed. It types a word letter by letter, holds it, erases it, and moves to the next. It
 * works on code points, so a Devanagari letter is never cut in half. With `enabled` off it just returns the
 * first word, so a person who has turned motion off sees a still hint.
 */
function useTypewriter(words: readonly string[], enabled: boolean): string {
  const [typed, setTyped] = useState('');
  // The words are compared by value, so a new array with the same words does not restart the typing.
  const key = words.join('\u0000');

  useEffect(() => {
    if (!enabled || key === '') return undefined;
    const list = key.split('\u0000');
    let word = 0;
    let count = 0;
    let erasing = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const letters = Array.from(list[word] ?? '');
      let delay: number;
      if (!erasing) {
        count += 1;
        delay = count >= letters.length ? HOLD_MS : TYPE_MS;
        if (count >= letters.length) erasing = true;
      } else {
        count -= 1;
        delay = count <= 0 ? GAP_MS : ERASE_MS;
        if (count <= 0) {
          erasing = false;
          word = (word + 1) % list.length;
        }
      }
      setTyped(letters.slice(0, Math.max(count, 0)).join(''));
      timer = setTimeout(step, delay);
    };

    timer = setTimeout(step, GAP_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [enabled, key]);

  return enabled ? typed : (words[0] ?? '');
}

/** A blinking bar after the typed word. It switches colour (to the bar's own) instead of disappearing, so nothing around it moves. */
function useBlink(enabled: boolean): boolean {
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(() => {
      setOn((current) => !current);
    }, CARET_MS);
    return () => {
      clearInterval(timer);
    };
  }, [enabled]);

  return on || !enabled;
}

function TypedHint({ hint }: { hint: SearchHint }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const animated = !reduceMotion && hint.words.length > 0;
  const word = useTypewriter(hint.words, animated);
  const caretOn = useBlink(animated);

  return (
    <View style={styles.hint} aria-hidden>
      <Text color="inkMuted" numberOfLines={1}>
        {hint.label} {OPEN_QUOTE}
        {word}
        {/* A thin bar after the word, hidden by matching the bar's colour so the text after it never shifts. */}
        {animated ? (
          <NativeText style={{ color: caretOn ? colors.inkMuted : colors.surface }}>
            {CARET}
          </NativeText>
        ) : null}
        {CLOSE_QUOTE}
      </Text>
    </View>
  );
}

/**
 * The search bar at the top of Home and of a shop. It is always a light field (the surface colour with a
 * hairline edge), so it reads on the tinted header in both themes. As a button it can type out example
 * searches, which also teaches people they can type "dudh" or "atta".
 */
export function SearchBar({ placeholder, onPress, hint, value, onChangeText }: SearchBarProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const icon = <Icon name="search" color={colors.inkMuted} size={22} />;

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

  return (
    <Pressable
      role="button"
      aria-label={placeholder}
      onPress={onPress}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      {icon}
      {hint !== undefined ? (
        <TypedHint hint={hint} />
      ) : (
        <View style={styles.hint}>
          <Text color="inkMuted" numberOfLines={1}>
            {placeholder}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
