import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { ShineSweep } from './ShineSweep';
import { radius } from './tokens';
import { useReduceMotion } from './useReduceMotion';
import { useScreenFocused } from './useScreenFocused';

export interface ProgressBarProps {
  /** How far along, from 0 to 1. */
  progress: number;
  /** The goal has been reached. A band of light crosses the bar once, when this turns true. */
  done?: boolean;
  /** Names what is progressing, for screen readers, for example "Free delivery". */
  label: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    track: { height: 4, borderRadius: radius.full, overflow: 'hidden', backgroundColor: c.line },
    fill: { height: 4, borderRadius: radius.full, backgroundColor: c.accentEdge },
  });

/**
 * A thin progress bar that fills smoothly instead of jumping when the amount changes (it grows from the left, on the
 * phone's animation thread), and gives one band of light when the goal is reached, so reaching it feels like something.
 */
export function ProgressBar({ progress, done = false, label }: ProgressBarProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const focused = useScreenFocused();
  const [width, setWidth] = useState(0);
  const clamped = Math.min(Math.max(progress, 0), 1);
  const [grown] = useState(() => new Animated.Value(clamped));

  useEffect(() => {
    if (reduceMotion) {
      grown.setValue(clamped);
      return undefined;
    }
    const grow = Animated.timing(grown, {
      toValue: clamped,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    grow.start();
    return () => {
      grow.stop();
    };
  }, [clamped, reduceMotion, grown]);

  return (
    <View
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      style={styles.track}
      onLayout={(event) => {
        setWidth(Math.round(event.nativeEvent.layout.width));
      }}
    >
      {width > 0 ? (
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              // Scaled from the middle, so slid left by half of what is missing to grow from the left edge.
              transform: [
                {
                  translateX: grown.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width / 2, 0],
                  }),
                },
                { scaleX: grown },
              ],
            },
          ]}
        />
      ) : null}
      <ShineSweep
        width={width}
        color={colors.surface}
        active={focused && done}
        trigger={done ? 1 : 0}
      />
    </View>
  );
}
