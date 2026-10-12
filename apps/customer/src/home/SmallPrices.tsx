import { formatRupees, money } from '@quibo/contracts';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Chip, RowTitle, Text, space } from '@/ui';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { anyCardNote, useHomeItems } from './items';
import { PRICE_TIERS, pickUnder } from './priceTiers';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
  tabs: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
  row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
});

/**
 * "Small prices": three tabs (under ₹30, ₹50, ₹100) over one swipeable row of the same compact cards as every other row, cheapest
 * first. The tabs are the same chips used elsewhere (the chosen one in lilac), the title is the same dotted-line title, and nothing in
 * it loads or moves: choosing a tab only swaps the row.
 */
export function SmallPrices() {
  const { t } = useLanguage();
  const items = useHomeItems();
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
      <View style={styles.tabs} role="radiogroup" aria-label={t('home.smallPrices.title')}>
        {PRICE_TIERS.map((tier, index) => (
          <Chip
            key={tier}
            label={t('home.smallPrices.under', { amount: amount(tier) })}
            selected={index === chosen}
            onPress={() => {
              setChosen(index);
            }}
          />
        ))}
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
              <ItemTile key={item.id} item={item} width={RAIL_CARD_WIDTH} reserveNote={note} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
