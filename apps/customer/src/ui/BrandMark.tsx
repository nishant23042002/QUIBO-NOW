import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import amul from '../../assets/brands/amul.png';
import aashirvaad from '../../assets/brands/aashirvaad.png';
import britannia from '../../assets/brands/britannia.png';
import chitale from '../../assets/brands/chitale.png';
import dairyMilk from '../../assets/brands/dairyMilk.png';
import fortune from '../../assets/brands/fortune.png';
import gokul from '../../assets/brands/gokul.png';
import indiaGate from '../../assets/brands/indiaGate.png';
import kitKat from '../../assets/brands/kitKat.png';
import lays from '../../assets/brands/lays.png';
import parle from '../../assets/brands/parle.png';
import bingo from '../../assets/brands/bingo.png';
import daawat from '../../assets/brands/daawat.png';
import gowardhan from '../../assets/brands/gowardhan.png';
import haldirams from '../../assets/brands/haldirams.png';
import kohinoor from '../../assets/brands/kohinoor.png';
import motherDairy from '../../assets/brands/motherDairy.png';
import pillsbury from '../../assets/brands/pillsbury.png';
import saffola from '../../assets/brands/saffola.png';
import warana from '../../assets/brands/warana.png';
import sunfeast from '../../assets/brands/sunfeast.png';
import { fitLogo } from './logic/logoFit';
import { Text } from './Text';
import { radius, space } from './tokens';

/**
 * The brands that have their own mark, by the brand's id (ADR 0036, 0040), with the picture's size in pixels (its shape is what
 * `fitLogo` works from, so change the numbers with the picture; `contain` keeps a picture undistorted either way). A brand that is not here (the ones whose official mark has not been supplied yet) is drawn as its letter on the same
 * plate, so a row of brands never has a gap or a different shape. The pictures are trimmed to their edges and drawn at about four
 * times the size they show at.
 */
export const BRAND_LOGOS: Readonly<
  Record<string, { source: ImageSourcePropType; width: number; height: number } | undefined>
> = {
  amul: { source: amul, width: 532, height: 178 },
  aashirvaad: { source: aashirvaad, width: 580, height: 189 },
  britannia: { source: britannia, width: 580, height: 206 },
  chitale: { source: chitale, width: 224, height: 104 },
  dairyMilk: { source: dairyMilk, width: 480, height: 240 },
  fortune: { source: fortune, width: 200, height: 65 },
  bingo: { source: bingo, width: 128, height: 80 },
  daawat: { source: daawat, width: 193, height: 78 },
  gowardhan: { source: gowardhan, width: 120, height: 49 },
  haldirams: { source: haldirams, width: 580, height: 310 },
  kohinoor: { source: kohinoor, width: 187, height: 77 },
  motherDairy: { source: motherDairy, width: 129, height: 78 },
  pillsbury: { source: pillsbury, width: 436, height: 436 },
  saffola: { source: saffola, width: 187, height: 45 },
  warana: { source: warana, width: 326, height: 196 },
  sunfeast: { source: sunfeast, width: 364, height: 336 },
  gokul: { source: gokul, width: 154, height: 86 },
  indiaGate: { source: indiaGate, width: 252, height: 324 },
  kitKat: { source: kitKat, width: 424, height: 148 },
  lays: { source: lays, width: 333, height: 284 },
  parle: { source: parle, width: 580, height: 229 },
};

export interface BrandMarkProps {
  /** The brand's id, which picks its logo. */
  brandId: string;
  /** The letter drawn when the brand has no logo yet. */
  mark: string;
  width: number;
  height: number;
  /** The plate's corner rounding. */
  rounded?: number;
  /** The room kept clear of the plate's edge, so a logo never touches it. */
  inset?: number;
  /** The letter's size when there is no logo. */
  letter?: 'heading' | 'label';
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // A logo is designed for white, so it always sits on a white plate, in the dark theme too.
    plate: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.logoPlate,
    },
  });

/**
 * A brand's mark on a plate: its official logo drawn at the size that gives every brand one visual weight (`fitLogo`), or its letter.
 * The plate is decorative; the screen's own label says the brand's name.
 */
export function BrandMark({
  brandId,
  mark,
  width,
  height,
  rounded = radius.md,
  inset = space[2],
  letter = 'heading',
}: BrandMarkProps) {
  const styles = useStyles(makeStyles);
  const logo = BRAND_LOGOS[brandId];
  const size =
    logo === undefined
      ? undefined
      : fitLogo(logo.width / logo.height, { width: width - inset * 2, height: height - inset * 2 });

  return (
    <View style={[styles.plate, { width, height, borderRadius: rounded }]} aria-hidden>
      {logo !== undefined && size !== undefined ? (
        <Image
          source={logo.source}
          style={{ width: size.width, height: size.height }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text variant={letter} color="ink">
          {mark}
        </Text>
      )}
    </View>
  );
}
