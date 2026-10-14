import { ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Chip, Icon, radius, space } from '@/ui';
import type { IntentId } from './homeIntents';
import { useHomeIntents } from './useHomeIntents';

const BADGE = 40;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[4] },
    // A small, squared sliders badge at the start of the row: the chips after it are filters, not places to go.
    badge: {
      width: BADGE,
      height: BADGE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.lilac,
    },
  });

/**
 * The row of quick filters under Home's banner (All, Quick, Offers, Under ₹50, Veg). They narrow the page that is showing: the usual
 * page on "All", or a category's page. Choosing one shows what suits it, from the chosen category or from every shelf. A sliders badge
 * leads the row and each chip carries a small picture of what it does, with a hard edge under it, so the row reads as buttons that
 * filter and not as a label.
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
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      aria-label={label}
    >
      <View style={styles.badge} aria-hidden>
        <Icon name="filter" color={colors.ink} size={20} />
      </View>
      {intents.map((intent) => (
        <Chip
          key={intent.key}
          label={intent.label}
          icon={intent.icon}
          tone="solid"
          selected={selected === intent.key}
          onPress={() => {
            onSelect(intent.key);
          }}
        />
      ))}
    </ScrollView>
  );
}
