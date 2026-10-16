import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface JumpToTopProps {
  /** Whether the page is far enough down for the pill to show. */
  visible: boolean;
  onPress: () => void;
  /** The words on the pill, already translated: "Back to top". */
  label: string;
  /** How far under the top of its parent it hangs. It sits clear of whatever stays pinned there (the chips, the tabs). */
  top?: number;
}

const SHOW_MS = 220;
const HIDE_MS = 160;
/** How far the pill rises into place from, so it drops in rather than appearing. */
const DROP = 10;
/** How much of the glass layer shows: a little under full, so the page is faintly visible behind the pill. */
const GLASS = 0.82;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // Fills the top of its parent without taking taps, so only the pill itself can be pressed.
    wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    // Small dark glass: the theme's overlay colour, drawn on its own layer a little thinner than it is (so the page shows through),
    // with a fine bright edge on that layer, and the words and arrow on top at full strength. A soft shadow on iOS; none on Android,
    // where a shadow behind a see-through pill would show through it.
    pill: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      paddingLeft: space[2] + 2,
      paddingRight: space[3],
      borderRadius: radius.full,
      shadowColor: c.chrome,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
    },
    glass: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.onOverlayMuted,
      backgroundColor: c.overlay,
      opacity: GLASS,
    },
    pressed: { opacity: 0.8 },
    up: { transform: [{ rotate: '180deg' }] },
  });

/**
 * A small "Back to top" pill that hangs at the top centre of a long page once it has been scrolled a good way down, and glides the page
 * back up when pressed. It drops in and fades (instantly when the phone asks for reduced motion), is small, thin dark glass so it
 * never shouts, and is out of the way (not pressable, hidden from a screen reader) while the page is near its top.
 */
export function JumpToTop({ visible, onPress, label, top = space[3] }: JumpToTopProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [shown] = useState(() => new Animated.Value(visible ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      shown.setValue(visible ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(shown, {
      toValue: visible ? 1 : 0,
      duration: visible ? SHOW_MS : HIDE_MS,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [visible, reduceMotion, shown]);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top }]}>
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        aria-hidden={!visible}
        style={{
          opacity: shown,
          transform: [
            { translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [-DROP, 0] }) },
          ],
        }}
      >
        <Pressable
          role="button"
          aria-label={label}
          hitSlop={8}
          onPress={onPress}
          style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
        >
          <View style={styles.glass} pointerEvents="none" />
          <View style={styles.up} aria-hidden>
            <Icon name="chevron" color={colors.onOverlay} size={14} />
          </View>
          <Text variant="caption" color="onOverlay">
            {label}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
