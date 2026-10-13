import { ScrollView, StyleSheet } from 'react-native';
import { Chip, space } from '@/ui';
import type { IntentId } from './homeIntents';
import { useHomeIntents } from './useHomeIntents';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
});

/**
 * The row of chips under Home's banner (All, Quick, Offers, Under ₹50, Veg). They narrow the page that is showing: the usual page on
 * "All", or a category's page. Choosing one shows what suits it, from the chosen category or from every shelf.
 */
export function IntentChips({
  selected,
  onSelect,
  label,
}: {
  selected: IntentId;
  onSelect: (intent: IntentId) => void;
  /** Names the row for a screen reader, for example "Quick filters". */
  label: string;
}) {
  const intents = useHomeIntents();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      aria-label={label}
    >
      {intents.map((intent) => (
        <Chip
          key={intent.key}
          label={intent.label}
          selected={selected === intent.key}
          onPress={() => {
            onSelect(intent.key);
          }}
        />
      ))}
    </ScrollView>
  );
}
