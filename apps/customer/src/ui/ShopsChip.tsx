import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { initialOf } from './logic/initial';
import { Text, type TextColor } from './Text';
import { useReduceMotion } from './useReduceMotion';
import { radius, space } from './tokens';

export interface ShopsChipProps {
  /** Up to three shop names; each shows as a round initial. Pass the names in the current language. */
  shopNames: readonly string[];
  /** The sentence, already worded and pluralised, for example "12 local shops open now". */
  label: string;
  /** Whether the list of shops is showing. The chevron turns to match. */
  open: boolean;
  onPress: () => void;
}

const AVATAR = 28;
const MAX_AVATARS = 3;
const OVERLAP = space[2];
const RING = 2;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    chip: {
      minHeight: space[10],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      alignSelf: 'flex-start',
      maxWidth: '100%',
      paddingVertical: space[1],
      paddingLeft: space[1],
      paddingRight: space[3],
      borderRadius: radius.full,
      backgroundColor: c.headerControl,
    },
    avatars: { flexDirection: 'row', alignItems: 'center' },
    // The ring is the chip's own colour, so overlapping circles read as separate shops.
    avatar: {
      width: AVATAR + RING * 2,
      height: AVATAR + RING * 2,
      borderRadius: radius.full,
      borderWidth: RING,
      borderColor: c.headerControl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlap: { marginLeft: -OVERLAP },
    label: { flexShrink: 1 },
    pressed: { opacity: 0.85 },
  });

/** Which fill and letter colour each avatar takes, in order. Each pair is checked in palette.test.ts. */
const AVATAR_TONES = [
  { fill: 'tagBg', letter: 'tagFg' },
  { fill: 'accent', letter: 'onAccent' },
  { fill: 'chrome', letter: 'onChrome' },
] as const satisfies readonly { fill: keyof ThemeColors; letter: TextColor }[];

/**
 * The trust line under the address: round initials of real shops in the town, and how many are open.
 * It says "your neighbours' shops", not "a warehouse", which is what sets Quibo apart. Tapping it
 * opens the list of those shops under it, and the chevron turns.
 */
export function ShopsChip({ shopNames, label, open, onPress }: ShopsChipProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [turn] = useState(() => new Animated.Value(open ? 1 : 0));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      turn.setValue(open ? 1 : 0);
      return;
    }
    Animated.timing(turn, {
      toValue: open ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, reduceMotion, turn]);

  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-expanded={open}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <View style={styles.avatars} aria-hidden>
        {shopNames.slice(0, MAX_AVATARS).map((name, index) => {
          const tone = AVATAR_TONES[index % AVATAR_TONES.length] ?? AVATAR_TONES[0];
          return (
            <View
              key={`${name}-${index}`}
              style={[
                styles.avatar,
                index > 0 && styles.overlap,
                { backgroundColor: colors[tone.fill] },
              ]}
            >
              {/* Decorative, and it must stay inside its circle however large the phone's text is. */}
              <Text variant="strong" color={tone.letter} maxFontSizeMultiplier={1}>
                {initialOf(name)}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.label}>
        <Text variant="strong" color="onHeaderControl" numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Animated.View
        aria-hidden
        style={{
          transform: [
            { rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
          ],
        }}
      >
        <Icon name="chevron" color={colors.onHeaderControl} size={16} />
      </Animated.View>
    </Pressable>
  );
}
