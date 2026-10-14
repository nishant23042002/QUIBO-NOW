import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface SegmentedTabsOption {
  key: string;
  /** Already translated. */
  label: string;
}

export interface SegmentedTabsProps {
  options: readonly SegmentedTabsOption[];
  /** The key of the chosen option. */
  selected: string;
  onSelect: (key: string) => void;
  /** Names the group for a screen reader, for example "Small prices". */
  label: string;
}

/** The track's padding, and the option's height: together a 48 dp control, the touch size the app keeps. */
const PAD = 4;
const OPTION_HEIGHT = 40;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      gap: space[1] / 2,
      padding: PAD,
      borderRadius: radius.md,
      backgroundColor: c.lilac,
    },
    option: {
      flex: 1,
      minWidth: 0,
      minHeight: OPTION_HEIGHT,
      paddingHorizontal: space[2],
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    // The chosen option is raised by its surface and a hairline, not by a shadow, so it costs nothing to draw.
    chosen: { backgroundColor: c.surface, borderColor: c.line },
    pressed: { opacity: 0.8 },
  });

/**
 * A few options in one square-cornered track, like a segmented control: the chosen one raised with a hairline, the others bare on the
 * lilac. For choices that swap one row of content in place (the price tiers of "Small prices"), where a row of separate chips would
 * read as filters. Every option is 40 dp tall inside a 48 dp track.
 */
export function SegmentedTabs({ options, selected, onSelect, label }: SegmentedTabsProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.track} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const chosen = option.key === selected;
        return (
          <Pressable
            key={option.key}
            role="radio"
            aria-checked={chosen}
            aria-label={option.label}
            onPress={() => {
              onSelect(option.key);
            }}
            style={({ pressed }) => [
              styles.option,
              chosen && styles.chosen,
              pressed && styles.pressed,
            ]}
          >
            <Text
              variant="strong"
              color={chosen ? 'ink' : 'inkMuted'}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
