import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from './Chip';
import { space } from './tokens';

export interface BrandChipsProps {
  /** The brands to choose from, in the order to show them. */
  brands: readonly { id: string; name: string }[];
  /** The brand chosen, or null for all of them. */
  selected: string | null;
  onSelect: (brandId: string | null) => void;
  /** The first chip, for example "All". Pass a translated string. */
  allLabel: string;
  /** Names the row for a screen reader, for example "Filter by brand". */
  label: string;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
});

/**
 * A row of chips to narrow a list to one brand: "All" first, then each brand. It sits above a long list of items (a category on Home,
 * search results, a shop's page); the screen decides when there are enough brands for it to be worth showing (two or more).
 */
export function BrandChips({ brands, selected, onSelect, allLabel, label }: BrandChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      aria-label={label}
    >
      <Chip
        label={allLabel}
        selected={selected === null}
        onPress={() => {
          onSelect(null);
        }}
      />
      {brands.map((brand) => (
        <Chip
          key={brand.id}
          label={brand.name}
          selected={selected === brand.id}
          onPress={() => {
            onSelect(brand.id);
          }}
        />
      ))}
    </ScrollView>
  );
}
