import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';
import { radius } from './tokens';

export interface GlassPanelProps {
  children: ReactNode;
  /** Padding, gaps and the like. The panel draws its own corners, fill and edge. */
  style?: StyleProp<ViewStyle>;
}

const STYLES = StyleSheet.create({
  panel: { overflow: 'hidden', borderRadius: radius.xl },
});

/**
 * A frosted-glass panel for the deep header colour: a faint white sheen that is a little brighter at its top left, a soft accent
 * glow in one corner, a bright hairline round the edge and a brighter one along the top. It is drawn with a few gradients, so it
 * costs nothing on a low-end phone and needs no blur library; a true backdrop blur would show nothing on a flat canvas anyway.
 * Every colour comes from the theme (the header's text white and the accent, at low strength), so it follows both themes.
 */
export function GlassPanel({ children, style }: GlassPanelProps) {
  const { colors } = useTheme();
  const key = useId().replace(/[^a-zA-Z0-9]/g, '');
  const sheen = `glass-sheen-${key}`;
  const glow = `glass-glow-${key}`;

  return (
    <View style={[STYLES.panel, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.onHeader} stopOpacity={0.2} />
              <Stop offset="1" stopColor={colors.onHeader} stopOpacity={0.05} />
            </LinearGradient>
            <RadialGradient id={glow} cx="1" cy="0" r="0.85">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.32} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${sheen})`} />
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${glow})`} />
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={radius.xl}
            ry={radius.xl}
            fill="none"
            stroke={colors.onHeader}
            strokeOpacity={0.34}
            strokeWidth={2}
          />
          <Rect
            x={radius.xl}
            y="0"
            width="100%"
            height="1"
            fill={colors.onHeader}
            fillOpacity={0.5}
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}
