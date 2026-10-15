import { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';
import { radius } from './tokens';

/** The edge is this thick, and as strong as this at its top, where it meets the page. */
const EDGE = 1.5;
const EDGE_OPACITY = 0.8;

/**
 * A soft pistachio wash behind a module, strongest at its top and gone by its bottom, so the module reads as set apart without a
 * hard edge. Its top corners are curved and a fine pistachio edge follows them and runs down the sides, fading out with the wash, so
 * the module is plainly divided from the page above it. It fills its parent and sits under the parent's other children; the parent
 * clips to the same curve (`overflow: 'hidden'` with the top corners at `radius.section`).
 */
export function AccentWash() {
  const { colors } = useTheme();
  const key = useId().replace(/[^a-zA-Z0-9]/g, '');
  const washId = `accent-wash-${key}`;
  const edgeId = `accent-edge-${key}`;
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const { width, height } = size;
  const r = radius.section;
  const half = EDGE / 2;
  const path =
    `M${half} ${height} V${r} A${r - half} ${r - half} 0 0 1 ${r} ${half} ` +
    `H${width - r} A${r - half} ${r - half} 0 0 1 ${width - half} ${r} V${height}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout} aria-hidden>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={washId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentSubtle} />
            <Stop offset="1" stopColor={colors.bg} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${washId})`} />
      </Svg>
      {width > 0 && height > r ? (
        <View style={StyleSheet.absoluteFill}>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient
                id={edgeId}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={height}
              >
                <Stop offset="0" stopColor={colors.accent} stopOpacity={EDGE_OPACITY} />
                <Stop offset="0.5" stopColor={colors.accent} stopOpacity={EDGE_OPACITY * 0.35} />
                <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={path} fill="none" stroke={`url(#${edgeId})`} strokeWidth={EDGE} />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}
