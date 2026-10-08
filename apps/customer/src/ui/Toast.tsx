import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface ToastProps {
  /** Shows the toast when it becomes true, and slides it away when it becomes false. */
  visible: boolean;
  /** What happened, for example "Toned milk removed". */
  message: string;
  /** The button on the toast, for example "Undo". */
  actionLabel: string;
  onAction: () => void;
  /** Called when the toast has been up long enough and goes by itself. */
  onTimeout: () => void;
  /** How far its bottom edge sits above the bottom of the screen. */
  bottom: number;
}

const SHOWN_FOR_MS = 4500;
const HIDDEN_BY = 80;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: space[4], right: space[4] },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingLeft: space[4],
      paddingRight: space[2],
      minHeight: 48,
      borderRadius: radius.lg,
      backgroundColor: c.chrome,
    },
    message: { flex: 1, minWidth: 0, paddingVertical: space[2] },
    action: { minHeight: 48, justifyContent: 'center', paddingHorizontal: space[3] },
    pressed: { opacity: 0.7 },
  });

/**
 * A short message that slides up from the bottom, such as "Toned milk removed" with an "Undo" button. It goes
 * by itself after a few seconds. Announced to screen readers when it appears.
 */
export function Toast({ visible, message, actionLabel, onAction, onTimeout, bottom }: ToastProps) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const [shown] = useState(() => new Animated.Value(visible ? 1 : 0));
  // The latest callback, so a new render does not restart the wait.
  const timeout = useRef(onTimeout);
  useEffect(() => {
    timeout.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (reduceMotion) {
      shown.setValue(visible ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(shown, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [visible, reduceMotion, shown]);

  // It stays for a few seconds and then asks to be taken away. A new message restarts the wait.
  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => {
      timeout.current();
    }, SHOWN_FOR_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [visible, message]);

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      aria-hidden={!visible}
      style={[
        styles.wrap,
        {
          bottom,
          opacity: shown,
          transform: [
            { translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [HIDDEN_BY, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.toast} role="alert">
        <View style={styles.message}>
          <Text variant="strong" color="onChrome" numberOfLines={2}>
            {message}
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text variant="strong" color="onChrome" numberOfLines={1}>
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
