import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { RowTitle, SeeAllButton, Text, UnderlineTabs, space } from '@/ui';
import { anyCardNote, useHomeListing } from './items';
import { ItemTile, gridCardWidth } from './ItemTile';
import { TRENDING_TABS, TRENDING_UNDER, trendingItems, type TrendingTab } from './trendingRules';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
});

/**
 * "Trending in Roha" (ADR 0055, step 7): a two-column grid of what is on the shelves, with its own tabs (all items, offers, under
 * ₹50, veg), then "See all", which opens the Categories tab. The tabs are views of the same items and not categories. The
 * cards are the usual item cards, one of each kind, so ADD and the stepper behave as on every other row.
 */
export function Trending() {
  const { t } = useLanguage();
  const router = useRouter();
  const { width: screen } = useWindowDimensions();
  const listing = useHomeListing();
  const [tab, setTab] = useState<TrendingTab>('all');
  const picked = trendingItems(tab, listing);
  const note = anyCardNote(picked);
  const width = gridCardWidth(screen);
  const label = (entry: TrendingTab): string =>
    entry === 'under'
      ? t('home.trending.under', { amount: formatRupees(money(TRENDING_UNDER)) })
      : t(`home.trending.${entry}`);

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.trending.title')} />
      </View>
      <UnderlineTabs
        label={t('home.trending.title')}
        tabs={TRENDING_TABS.map((entry) => ({ key: entry, label: label(entry) }))}
        selectedKey={tab}
        onSelect={(key) => {
          const found = TRENDING_TABS.find((entry) => entry === key);
          if (found !== undefined) setTab(found);
        }}
      />
      {picked.length === 0 ? (
        <View style={styles.pad}>
          <Text color="inkMuted">{t('home.trending.empty')}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {picked.map((item) => (
            <ItemTile key={item.id} item={item} width={width} reserveNote={note} />
          ))}
        </View>
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
