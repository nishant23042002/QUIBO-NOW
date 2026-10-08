import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface DeliveryWindowOption {
  id: string;
  /** The window as a clock range, for example "4–6 PM". Never minutes. */
  label: string;
  /** A full window can be seen but not chosen. */
  available: boolean;
}

export interface WindowPickerProps {
  options: readonly DeliveryWindowOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Read out for a full window, for example "full". Pass a translated string. */
  unavailableLabel: string;
  /** Names the group for screen readers, for example "Delivery window". */
  groupLabel: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    group: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    option: {
      minHeight: 48,
      minWidth: 112,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
      paddingHorizontal: space[4],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    selected: { borderColor: c.action, backgroundColor: c.accentSubtle },
    unavailable: { opacity: 0.55, borderColor: c.line },
    pressed: { opacity: 0.8 },
  });

/**
 * The delivery window choice at checkout. One window can be selected; a full one stays visible but
 * struck through and cannot be chosen, and says so to screen readers.
 */
export function WindowPicker({
  options,
  selectedId,
  onSelect,
  unavailableLabel,
  groupLabel,
}: WindowPickerProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View role="radiogroup" aria-label={groupLabel} style={styles.group}>
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            role="radio"
            aria-checked={selected}
            aria-disabled={!option.available}
            aria-label={option.available ? option.label : `${option.label}, ${unavailableLabel}`}
            disabled={!option.available}
            onPress={() => {
              onSelect(option.id);
            }}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              !option.available && styles.unavailable,
              pressed && styles.pressed,
            ]}
          >
            {selected ? <Icon name="check" color={colors.ink} size={16} /> : null}
            <Text variant="strong" strike={!option.available}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
