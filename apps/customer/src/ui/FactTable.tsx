import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { space } from './tokens';

export interface FactRow {
  /** For example "Shelf life". Pass a translated string. */
  label: string;
  /** For example "2 days". */
  value: string;
}

const makeStyles = (_c: ThemeColors) =>
  StyleSheet.create({
    table: { gap: space[3] },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    label: { width: '32%' },
    value: { flex: 1, minWidth: 0 },
  });

/** Facts as two columns: what it is in a quiet colour on the left, its value on the right. */
export function FactTable({ rows }: { rows: readonly FactRow[] }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.table}>
      {rows.map((row) => (
        <View
          key={row.label}
          style={styles.row}
          accessible
          aria-label={`${row.label}: ${row.value}`}
        >
          <View style={styles.label}>
            <Text variant="small" color="inkMuted">
              {row.label}
            </Text>
          </View>
          <View style={styles.value}>
            <Text>{row.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
