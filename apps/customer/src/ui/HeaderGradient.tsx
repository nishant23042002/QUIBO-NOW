import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * A very light left-to-right sheen on the header's colour: `headerBg` at the left edge and `headerBgEnd` at the right. It fills its
 * parent and sits under the parent's other children. It runs across, not down, so the pieces of a header that move apart as the page
 * scrolls (the status bar's tint, the upper part, the search bar and tabs) always have the same colour at the same distance from the
 * left, and never show a seam wherever they come to rest.
 */
export function HeaderGradient() {
  const { colors } = useTheme();
  const id = `header-sheen-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} aria-hidden>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.headerBg} />
            <Stop offset="1" stopColor={colors.headerBgEnd} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
