import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { QMark } from './brand/Logo';
import { radius } from './tokens';

export interface QTileProps {
  /** The tile's width and height. The mark inside is about two thirds of it. */
  size: number;
  /** What a screen reader says. Pass the translated app name. */
  label: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tile: { alignItems: 'center', justifyContent: 'center', backgroundColor: c.chrome },
  });

/**
 * The logo's Q with its speed lines, on the dark of the header and the cart bar, as a small rounded tile. It stands for
 * Quibo's own quick delivery wherever the app wants a picture for it, in place of a generic lightning bolt.
 */
export function QTile({ size, label }: QTileProps) {
  const styles = useStyles(makeStyles);
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size <= 40 ? radius.md : radius.lg },
      ]}
    >
      <QMark size={Math.round(size * 0.68)} ground="chrome" label={label} />
    </View>
  );
}
