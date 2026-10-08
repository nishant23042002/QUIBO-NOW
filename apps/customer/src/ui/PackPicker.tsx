import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface PackOption {
  id: string;
  /** For example "500 ml". */
  label: string;
  /** For example "₹29". */
  priceLabel: string;
  /** For example "₹58/L". Leave out when the packs cannot be compared. */
  unitLabel?: string;
  /** For example "Best value". Leave out for the others. */
  tagLabel?: string;
  /** For example "Out of stock". When present the pack cannot be chosen. */
  unavailableLabel?: string;
}

export interface PackPickerProps {
  /** The heading above the options, for example "Pick a size". */
  title: string;
  options: readonly PackOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    group: { gap: space[2] },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    option: {
      minWidth: 104,
      flexGrow: 1,
      flexBasis: 104,
      gap: 2,
      paddingHorizontal: space[3],
      paddingTop: space[3],
      paddingBottom: space[2],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    selected: { borderColor: c.action, backgroundColor: c.accentSubtle },
    unavailable: { opacity: 0.55, borderStyle: 'dashed' },
    // The tag hangs over the option's top edge, so every option is the same height with or without one.
    tag: {
      position: 'absolute',
      top: -10,
      left: space[3],
      paddingHorizontal: space[2],
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
    pressed: { opacity: 0.8 },
  });

/**
 * The sizes a product comes in, as tappable options: each shows its size and price, the price per litre, kilogram
 * or piece so sizes can be compared, and a "Best value" tag on the cheapest per unit. The chosen one has the
 * action colour as its edge. An out-of-stock size is dimmed and cannot be chosen.
 */
export function PackPicker({ title, options, selectedId, onSelect }: PackPickerProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.group} role="radiogroup" aria-label={title}>
      <Text variant="strong">{title}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          const unavailable = option.unavailableLabel !== undefined;
          return (
            <Pressable
              key={option.id}
              role="radio"
              aria-checked={selected}
              aria-disabled={unavailable}
              aria-label={[
                option.label,
                option.priceLabel,
                option.unitLabel,
                option.tagLabel,
                option.unavailableLabel,
              ]
                .filter((part) => part !== undefined)
                .join('. ')}
              disabled={unavailable}
              onPress={() => {
                onSelect(option.id);
              }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                unavailable && styles.unavailable,
                pressed && styles.pressed,
              ]}
            >
              {option.tagLabel !== undefined ? (
                <View style={styles.tag}>
                  <Text variant="caption" color="onAccent" numberOfLines={1}>
                    {option.tagLabel}
                  </Text>
                </View>
              ) : null}
              <Text variant="strong">{option.label}</Text>
              <Text variant="label">{option.priceLabel}</Text>
              <Text variant="small" color="inkMuted" numberOfLines={1}>
                {option.unavailableLabel ?? option.unitLabel ?? ' '}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
