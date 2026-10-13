import { formatRupees, money } from '@quibo/contracts';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { RowTitle, SegmentedTabs, Text, space } from '@/ui';
import { anyCardNote, useHomeListing } from './items';
import { PRICE_TILE_WIDTH, PriceTile } from './PriceTile';
import { PRICE_TIERS, pickUnder } from './priceTiers';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
  row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
});

/**
 * "Small prices" (ADR 0047): three tiers (under ₹30, ₹50, ₹100) as one segmented control over one swipeable row of price-first cards,
 * cheapest first. The title is the same dotted-line title the other rows have, and nothing in it loads or moves: choosing a tier only
 * swaps the row.
 */
export function SmallPrices() {
  const { t } = useLanguage();
  const items = useHomeListing();
  const [chosen, setChosen] = useState(1);
  const limit = PRICE_TIERS[chosen] ?? PRICE_TIERS[0] ?? 0;
  const picked = pickUnder(items, limit);
  const note = anyCardNote(picked);
  const amount = (tier: number) => formatRupees(money(tier));

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.smallPrices.title')} />
      </View>
      <View style={styles.pad}>
        <SegmentedTabs
          label={t('home.smallPrices.title')}
          options={PRICE_TIERS.map((tier) => ({
            key: String(tier),
            label: t('home.smallPrices.under', { amount: amount(tier) }),
          }))}
          selected={String(limit)}
          onSelect={(key) => {
            setChosen(
              Math.max(
                0,
                PRICE_TIERS.findIndex((tier) => String(tier) === key),
              ),
            );
          }}
        />
      </View>
      {picked.length === 0 ? (
        <View style={styles.pad}>
          <Text variant="small" color="inkMuted">
            {t('home.smallPrices.empty', { amount: amount(limit) })}
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {picked.map((item) => (
              <PriceTile key={item.id} item={item} width={PRICE_TILE_WIDTH} reserveNote={note} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
