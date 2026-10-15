import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import type { FactRow } from './FactTable';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface HighlightsStripProps {
  /** The facts to show as chips, for example Fat Profile: Toned. A few; the rest are behind the button. */
  chips: readonly FactRow[];
  /** The button's words, for example "View details". */
  actionLabel: string;
  onAction: () => void;
  /** Draws the button's border at the weight of the page's small pills (1 dp), not the heavier 1.5 dp. */
  slim?: boolean;
}

const CHIP_MIN = 88;
const CHIP_MAX = 168;
const ACTION_WIDTH = 72;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'stretch', gap: space[2] },
    scroll: { flex: 1, minWidth: 0 },
    chips: { flexDirection: 'row', gap: space[2] },
    chip: {
      minWidth: CHIP_MIN,
      maxWidth: CHIP_MAX,
      paddingHorizontal: space[3],
      paddingVertical: space[2],
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.lilac,
    },
    action: {
      width: ACTION_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space[1],
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.accentInk,
      backgroundColor: c.accentSubtle,
    },
    actionSlim: { borderWidth: 1 },
    pressed: { opacity: 0.8 },
  });

/** One fact as a small tile: its name in a quiet colour over its value. */
export function FactChip({ chip }: { chip: FactRow }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.chip} accessible aria-label={`${chip.label}: ${chip.value}`}>
      <Text variant="fine" color="inkMuted" numberOfLines={1}>
        {chip.label}
      </Text>
      <Text variant="strong" numberOfLines={1}>
        {chip.value}
      </Text>
    </View>
  );
}

/**
 * A short strip of the facts that tell a product apart (Fat Profile, Shelf Life, Biological Source), as chips that slide sideways,
 * and a button at its end that opens all the details. It is one row of one line each, so a shopper sees what it is at a glance and
 * the long facts stay out of the way until asked for.
 */
export function HighlightsStrip({
  chips,
  actionLabel,
  onAction,
  slim = false,
}: HighlightsStripProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.chips}
      >
        {chips.map((chip) => (
          <FactChip key={chip.label} chip={chip} />
        ))}
      </ScrollView>
      <Pressable
        role="button"
        aria-label={actionLabel}
        onPress={onAction}
        style={({ pressed }) => [
          styles.action,
          slim && styles.actionSlim,
          pressed && styles.pressed,
        ]}
      >
        <Text variant="caption" color="accentInk" align="center">
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
