import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * A soft pistachio wash behind a module, strongest at its top and gone by its bottom, so the module reads as set apart without a
 * hard edge. It fills its parent and sits under the parent's other children.
 */
export function AccentWash() {
  const { colors } = useTheme();
  const id = `accent-wash-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} aria-hidden>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentSubtle} />
            <Stop offset="1" stopColor={colors.bg} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
