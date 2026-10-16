import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface FadeStop {
  /** A colour from the theme. */
  color: string;
  /** Where it sits down the block, 0 at the top and 1 at the bottom. */
  at: number;
}

/**
 * A smooth top-to-bottom blend through the given colours. It fills its parent and sits under the parent's other children, so a
 * block can start in the colour of what is above it (the header) and end in the colour of what is below it (the page) with no seam
 * between. It runs one way only, so it never moves or changes size with the content.
 */
export function VerticalFade({ stops }: { stops: readonly FadeStop[] }) {
  const id = `vertical-fade-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} aria-hidden>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            {stops.map((stop) => (
              <Stop key={stop.at} offset={stop.at} stopColor={stop.color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
