import { useId, useState, type ReactNode } from 'react';
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
 *
 * The drawing is given the panel's measured size and redrawn whenever it changes, because the panel's height depends on its
 * words (a phone with large text, or a longer name, makes it taller) and a drawing left at its first size would stop short.
 */
export function GlassPanel({ children, style }: GlassPanelProps) {
  const { colors } = useTheme();
  const key = useId().replace(/[^a-zA-Z0-9]/g, '');
  const sheen = `glass-sheen-${key}`;
  const glow = `glass-glow-${key}`;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;
  const r = radius.xl;

  return (
    <View
      style={[STYLES.panel, style]}
      onLayout={(event) => {
        const { width: w, height: h } = event.nativeEvent.layout;
        setSize((current) =>
          current.width === w && current.height === h ? current : { width: w, height: h },
        );
      }}
    >
      {width > 0 && height > 0 ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
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
            <Rect x={0} y={0} width={width} height={height} rx={r} ry={r} fill={`url(#${sheen})`} />
            <Rect x={0} y={0} width={width} height={height} rx={r} ry={r} fill={`url(#${glow})`} />
            <Rect
              x={1}
              y={1}
              width={width - 2}
              height={height - 2}
              rx={r - 1}
              ry={r - 1}
              fill="none"
              stroke={colors.onHeader}
              strokeOpacity={0.34}
              strokeWidth={2}
            />
            <Rect
              x={r}
              y={0}
              width={Math.max(width - r * 2, 0)}
              height={1}
              fill={colors.onHeader}
              fillOpacity={0.5}
            />
          </Svg>
        </View>
      ) : null}
      {children}
    </View>
  );
}
