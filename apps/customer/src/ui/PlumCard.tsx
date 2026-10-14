import { useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { radius, space } from './tokens';

const GLOW = 180;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.xl,
      overflow: 'hidden',
      backgroundColor: c.plum,
      paddingHorizontal: space[4],
      paddingTop: space[5],
      paddingBottom: space[4],
      gap: space[3],
    },
    glow: { position: 'absolute', right: -50, top: -60, width: GLOW, height: GLOW },
    sheen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  });

/**
 * A deep aubergine card with a very light sheen and a pistachio glow in the top-right corner: the closing card of "Know your shop"
 * and the Quibo promise. Everything on it uses `onPlum` and `onPlumMuted`, and a pistachio fill with `onAccent` for its main button.
 * The children sit above the glow. It is the same deep colour whatever the header is.
 */
export function PlumCard({ children }: { children: ReactNode }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const key = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = `plum-glow-${key}`;
  const sheenId = `plum-sheen-${key}`;

  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.sheen} aria-hidden>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.plum} />
              <Stop offset="1" stopColor={colors.plumEnd} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${sheenId})`} />
        </Svg>
      </View>
      <View pointerEvents="none" style={styles.glow} aria-hidden>
        <Svg width={GLOW} height={GLOW}>
          <Defs>
            <RadialGradient id={id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.3} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill={`url(#${id})`} />
        </Svg>
      </View>
      {children}
    </View>
  );
}
