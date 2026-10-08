import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReduceMotion } from './useReduceMotion';

export interface CollapsibleProps {
  open: boolean;
  children: ReactNode;
}

const DURATION_MS = 260;

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  // Laid out at its natural height even while collapsed, so its height is known before the first open.
  measure: { position: 'absolute', top: 0, left: 0, right: 0 },
});

/**
 * Content that slides open and closed in place, pushing what is below it. The height and the fade run
 * together on one value. While closed it is hidden from screen readers and cannot be touched.
 */
export function Collapsible({ open, children }: CollapsibleProps) {
  const [progress] = useState(() => new Animated.Value(open ? 1 : 0));
  const [height, setHeight] = useState(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(open ? 1 : 0);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: DURATION_MS,
      easing: open ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      // Height is a layout property, which the native driver cannot animate. It is a short, small panel.
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [open, reduceMotion, progress]);

  return (
    <Animated.View
      aria-hidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      pointerEvents={open ? 'auto' : 'none'}
      style={[
        styles.clip,
        {
          height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, height] }),
          opacity: progress,
        },
      ]}
    >
      <View
        style={styles.measure}
        onLayout={(event) => {
          setHeight(event.nativeEvent.layout.height);
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}
