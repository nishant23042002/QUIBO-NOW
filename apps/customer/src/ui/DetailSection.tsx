import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { FactTable, type FactRow } from './FactTable';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';

export interface DetailSectionProps {
  /** The section's name, for example "Key Information". */
  title: string;
  rows: readonly FactRow[];
  open: boolean;
  onToggle: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { borderRadius: radius.lg, backgroundColor: c.bg, overflow: 'hidden' },
    head: {
      minHeight: TAP_MIN + space[1],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    title: { flex: 1 },
    body: {
      paddingHorizontal: space[4],
      paddingTop: space[3],
      paddingBottom: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    flipped: { transform: [{ rotate: '180deg' }] },
    pressed: { opacity: 0.8 },
  });

/**
 * One collapsible block of facts in the details sheet: a quiet bar with the section's name and a chevron, and the facts as a
 * two-column table once it is opened. The bar says whether it is open for a screen reader.
 */
export function DetailSection({ title, rows, open, onToggle }: DetailSectionProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Pressable
        role="button"
        aria-expanded={open}
        aria-label={title}
        onPress={onToggle}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <View style={styles.title}>
          <Text variant="label">{title}</Text>
        </View>
        <View style={open ? styles.flipped : undefined}>
          <Icon name="chevron" color={colors.ink} size={20} />
        </View>
      </Pressable>
      {open ? (
        <View style={styles.body}>
          <FactTable rows={rows} />
        </View>
      ) : null}
    </View>
  );
}
