import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { initialOf } from './logic/initial';
import { Text } from './Text';
import { radius } from './tokens';

export interface ProductImageProps {
  /** The item's name. Its first letter is shown until there is a photo. */
  name: string;
  /** A photo. Until one is chosen, every item shows the placeholder. */
  uri?: string;
  /** Width over height. */
  ratio?: number;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tile: {
      width: '100%',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.muted,
    },
    pattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    photo: { width: '100%', height: '100%' },
  });

/**
 * The picture of an item. A missing photo still looks designed: a tinted tile with the item's
 * first letter and a faint pair of speed lines, echoing the logo. A photo replaces it here only.
 */
export function ProductImage({ name, uri, ratio = 1 }: ProductImageProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  if (uri !== undefined) {
    return (
      <View style={[styles.tile, { aspectRatio: ratio }]}>
        <Image source={{ uri }} style={styles.photo} resizeMode="cover" aria-hidden />
      </View>
    );
  }

  return (
    <View style={[styles.tile, { aspectRatio: ratio }]} aria-hidden>
      <Svg style={styles.pattern} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Path d="M58 0H70L52 100H40Z" fill={colors.line} />
        <Path d="M76 0H82L64 100H58Z" fill={colors.line} />
      </Svg>
      <Text variant="heading" color="inkMuted">
        {initialOf(name)}
      </Text>
    </View>
  );
}
