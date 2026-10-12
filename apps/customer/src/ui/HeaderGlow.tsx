import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';

export interface HeaderGlowProps {
  /**
   * How far the glow reaches above the block it sits in, so it can run up behind the status bar too (pass the status bar's height).
   */
  lift?: number;
}

/**
 * The deep aubergine that the top of the header fades out of. It is laid over the header's own tint (whichever category's colour
 * that is, mid-fade or not) as a gradient from the app's dark colour to nothing, so the tint can keep changing underneath it. It
 * holds its depth over the heading and the address, so white text on them always reads, and has gone by the block's lower edge, where
 * the search bar starts on the plain tint with no seam.
 */
export function HeaderGlow({ lift = 0 }: HeaderGlowProps) {
  const { colors } = useTheme();
  const id = `glow-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View pointerEvents="none" aria-hidden style={[styles.fill, { top: -lift }]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.chrome} stopOpacity={1} />
            <Stop offset="0.5" stopColor={colors.chrome} stopOpacity={0.94} />
            <Stop offset="0.78" stopColor={colors.chrome} stopOpacity={0.42} />
            <Stop offset="1" stopColor={colors.chrome} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
