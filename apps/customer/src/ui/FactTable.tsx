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

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    table: { gap: space[3] },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    label: { width: '32%' },
    value: { flex: 1, minWidth: 0 },
    head: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    line: { flex: 1, height: 1, backgroundColor: c.line },
  });

/** A card's heading with a fine line running on after it, like a label on a printed pack. */
export function CardTitle({ children }: { children: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.head}>
      <Text variant="subheading" role="heading">
        {children}
      </Text>
      <View style={styles.line} aria-hidden />
    </View>
  );
}

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
