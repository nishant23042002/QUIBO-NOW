import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface SegmentedOption {
  key: string;
  label: string;
}

export interface SegmentedProps {
  options: readonly SegmentedOption[];
  value: string;
  onChange: (key: string) => void;
}

const PAD = space[1];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      padding: PAD,
      borderRadius: radius.full,
      backgroundColor: c.muted,
    },
    // The white pill under the chosen option, which slides to the other when the choice changes.
    pill: {
      position: 'absolute',
      top: PAD,
      bottom: PAD,
      left: PAD,
      borderRadius: radius.full,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.line,
    },
    option: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  });

/**
 * A small switch between a few views of one card, like "Tip" and "Instructions": a rounded track with a pill that slides
 * under the chosen one. Each option is as wide as the others.
 */
export function Segmented({ options, value, onChange }: SegmentedProps) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.key === value),
  );
  const [at] = useState(() => new Animated.Value(index));
  const optionWidth = options.length > 0 ? (width - PAD * 2) / options.length : 0;

  useEffect(() => {
    if (reduceMotion) {
      at.setValue(index);
      return undefined;
    }
    const slide = Animated.timing(at, {
      toValue: index,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    slide.start();
    return () => {
      slide.stop();
    };
  }, [index, reduceMotion, at]);

  return (
    <View
      style={styles.track}
      role="tablist"
      onLayout={(event) => {
        setWidth(Math.round(event.nativeEvent.layout.width));
      }}
    >
      {optionWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          aria-hidden
          style={[
            styles.pill,
            { width: optionWidth, transform: [{ translateX: Animated.multiply(at, optionWidth) }] },
          ]}
        />
      ) : null}
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            role="tab"
            aria-selected={active}
            onPress={() => {
              onChange(option.key);
            }}
            style={styles.option}
          >
            <Text variant="strong" color={active ? 'ink' : 'inkMuted'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
