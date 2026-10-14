import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * A straight fade from clear at the top to the page's own colour at the bottom. It fills its parent and sits over the parent's
 * background and under its other children, so a block that begins in the header's colour ends in the page's, with no edge between.
 */
export function PageFade() {
  const { colors } = useTheme();
  const id = `page-fade-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} aria-hidden>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
