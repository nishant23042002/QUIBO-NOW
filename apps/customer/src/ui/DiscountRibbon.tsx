import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { space } from './tokens';

export interface DiscountRibbonProps {
  /** The saving in rupees, already formatted, for example "₹6". Never a percentage. */
  amount: string;
  /** The word under it, for example "OFF". */
  offLabel: string;
}

/** How deep the swallowtail cut is at the bottom, in dp. */
const NOTCH = 6;

const makeStyles = (_c: ThemeColors) =>
  StyleSheet.create({
    ribbon: {
      minWidth: 36,
      alignItems: 'center',
      paddingHorizontal: space[1] + 2,
      paddingTop: space[1],
      // Room under the words for the cut.
      paddingBottom: NOTCH + 2,
    },
    shape: { position: 'absolute', top: 0, left: 0 },
  });

/**
 * A ribbon that hangs from the top edge of a picture, aubergine with a swallowtail cut, saying how many
 * rupees are saved. Its shape is drawn to match its own size, so any amount fits.
 */
export function DiscountRibbon({ amount, offLabel }: DiscountRibbonProps) {
  const styles = useStyles(makeStyles);
  const { colors, scheme } = useTheme();
  // Dark aubergine on the light theme; the brighter header aubergine on the dark theme, so the ribbon stands out from the deep picture tints.
  const fill = scheme === 'dark' ? colors.headerBg : colors.chrome;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;

  return (
    <View
      style={styles.ribbon}
      accessible
      aria-label={`${amount} ${offLabel}`}
      onLayout={(event) => {
        const { width: w, height: h } = event.nativeEvent.layout;
        setSize((current) =>
          current.width === w && current.height === h ? current : { width: w, height: h },
        );
      }}
    >
      {width > 0 ? (
        <Svg style={styles.shape} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path
            d={`M0 0H${width}V${height}L${width / 2} ${height - NOTCH}L0 ${height}Z`}
            fill={fill}
          />
        </Svg>
      ) : null}
      <Text variant="strong" color="onChrome" numberOfLines={1}>
        {amount}
      </Text>
      <Text variant="caption" color="onChromeMuted" numberOfLines={1}>
        {offLabel}
      </Text>
    </View>
  );
}
