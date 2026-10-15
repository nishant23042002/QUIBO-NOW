import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Chip, RowTitle, SeeAllButton, Text, space } from '@/ui';
import { anyCardNote, useHomeListing, type HomeItem } from './items';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { TRENDING_TABS, TRENDING_UNDER, trendingItems, type TrendingTab } from './trendingRules';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
  chips: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
  // Two rows of cards that scroll sideways together: each column holds one card over the next.
  columns: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  column: { gap: space[3] },
});

/** The items in pairs, so each pair is one column of two rows. The order runs down a column and then across. */
function inColumns(items: readonly HomeItem[]): HomeItem[][] {
  const columns: HomeItem[][] = [];
  for (let index = 0; index < items.length; index += 2) columns.push(items.slice(index, index + 2));
  return columns;
}

/**
 * "Trending in Roha" (ADR 0055, step 7): what is on the shelves, in two rows that scroll sideways together, with its own filter
 * chips (all items, offers, under ₹50, veg) in the same style as the other filters on Home, then "See all", which opens the
 * Categories tab. The chips are views of the same items and not categories. The cards are the usual item cards at the width of a
 * shelf's, so ADD and the stepper behave as on every other row.
 */
export function Trending() {
  const { t } = useLanguage();
  const router = useRouter();
  const listing = useHomeListing();
  const [tab, setTab] = useState<TrendingTab>('all');
  const picked = trendingItems(tab, listing);
  const note = anyCardNote(picked);
  const label = (entry: TrendingTab): string =>
    entry === 'under'
      ? t('home.trending.under', { amount: formatRupees(money(TRENDING_UNDER)) })
      : t(`home.trending.${entry}`);

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.trending.title')} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        aria-label={t('home.trending.title')}
      >
        <View style={styles.chips} role="group">
          {TRENDING_TABS.map((entry) => (
            <Chip
              key={entry}
              label={label(entry)}
              selected={tab === entry}
              onPress={() => {
                setTab(entry);
              }}
            />
          ))}
        </View>
      </ScrollView>
      {picked.length === 0 ? (
        <View style={styles.pad}>
          <Text color="inkMuted">{t('home.trending.empty')}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.columns}>
            {inColumns(picked).map((column) => (
              <View key={column.map((item) => item.id).join('-')} style={styles.column}>
                {column.map((item) => (
                  <ItemTile key={item.id} item={item} width={RAIL_CARD_WIDTH} reserveNote={note} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
      <SeeAllButton
        label={t('home.rails.seeAll')}
        title={t('home.trending.title')}
        onPress={() => {
          router.navigate('/categories');
        }}
      />
    </View>
  );
}
