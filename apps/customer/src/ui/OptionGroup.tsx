import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';

export interface Option<T extends string> {
  value: T;
  /** Already translated. A language is named in its own script so anyone can find theirs. */
  label: string;
}

export interface OptionGroupProps<T extends string> {
  /** The heading above the group, and the group's name for a screen reader. */
  title: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    group: { gap: space[2] },
    card: {
      borderWidth: 1,
      borderRadius: radius.lg,
      borderColor: c.line,
      backgroundColor: c.surface,
      overflow: 'hidden',
    },
    row: {
      minHeight: TAP_MIN + space[1],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    rowText: { flex: 1, minWidth: 0 },
    divider: { height: 1, marginLeft: space[4], backgroundColor: c.line },
    pressed: { backgroundColor: c.muted },
    check: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  });

/** A titled list of choices where exactly one is selected, such as language or theme. */
export function OptionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: OptionGroupProps<T>) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      <Text variant="strong" color="inkMuted">
        {title}
      </Text>
      <View role="radiogroup" aria-label={title} style={styles.card}>
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <View key={option.value}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                role="radio"
                aria-checked={selected}
                onPress={() => {
                  onChange(option.value);
                }}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.rowText}>
                  <Text variant={selected ? 'label' : 'body'}>{option.label}</Text>
                </View>
                <View style={styles.check}>
                  {selected ? <Icon name="check" color={colors.action} size={20} /> : null}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
