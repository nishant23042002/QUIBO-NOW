import { useEffect, useState } from 'react';
import { Animated, Easing, Image, View, type ImageSourcePropType } from 'react-native';
import { useReduceMotion } from './useReduceMotion';

export interface ProgressImageProps {
  source: ImageSourcePropType;
  /** How much of the picture is in full colour, from 0 to 1, opening from its left edge. */
  progress: number;
  /** The picture is drawn square, this wide and tall. */
  size: number;
  /** Paints a one-colour picture in this colour. Leave out for a picture drawn in full colour. */
  tint?: string | undefined;
}

/** The drawn part rarely touches the picture's edges, so a first bit of progress already shows. */
const FIRST_SHOWN = 0.12;
const GROW_MS = 320;
const QUIET = 0.35;

/**
 * A picture that is also a progress bar: it is drawn faded, and the same picture is laid over it in full colour inside a window
 * that opens from the left as `progress` grows, easing to each new value so a change is seen. Decorative.
 */
export function ProgressImage({ source, progress, size, tint }: ProgressImageProps) {
  const reduceMotion = useReduceMotion();
  const amount = Math.min(Math.max(progress, 0), 1);
  const edge = amount >= 1 ? 1 : amount > 0 ? FIRST_SHOWN + (1 - FIRST_SHOWN) * amount : 0;
  const [open] = useState(() => new Animated.Value(edge));

  useEffect(() => {
    if (reduceMotion) {
      open.setValue(edge);
      return undefined;
    }
    const move = Animated.timing(open, {
      toValue: edge,
      duration: GROW_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [edge, reduceMotion, open]);

  return (
    <View style={{ width: size, height: size }} aria-hidden>
      <Image
        source={source}
        resizeMode="contain"
        style={{ width: size, height: size, opacity: QUIET, tintColor: tint }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: size,
          overflow: 'hidden',
          width: open.interpolate({ inputRange: [0, 1], outputRange: [0, size] }),
        }}
      >
        <Image
          source={source}
          resizeMode="contain"
          style={{ width: size, height: size, tintColor: tint }}
        />
      </Animated.View>
    </View>
  );
}
