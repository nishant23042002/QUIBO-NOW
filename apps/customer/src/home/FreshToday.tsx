import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { AccentWash, IconTabs, LetteredTitle, SeeAllButton, Text, space, type IconTab } from '@/ui';
import { FRESH_TABS, UNDER_LIMIT, freshItems, type FreshTabId } from './fresh';
import { anyCardNote, useHomeListing, type ItemCategory } from './items';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';

const makeStyles = () =>
  StyleSheet.create({
    module: { paddingTop: space[4], gap: space[3] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    empty: { paddingHorizontal: space[4], paddingVertical: space[4] },
  });
const styles = makeStyles();

/**
 * "Fresh today" (ADR 0055, step 3): a lettered title, a row of round tabs (a price, vegetables, fruits, dairy, what is new) and the
 * item cards of the chosen tab, with a See all button under them. The cards are the usual item cards, so ADD, the stepper and
 * the cart bar behave exactly as on every other row.
 */
export function FreshToday({ onSeeAll }: { onSeeAll: (category: ItemCategory) => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const listing = useHomeListing();
  const [chosen, setChosen] = useState<FreshTabId>('under');
  const tab = FRESH_TABS.find((entry) => entry.id === chosen) ?? FRESH_TABS[0];
  const items = freshItems(chosen, listing);
  const note = anyCardNote(items);

  const tabs: IconTab[] = FRESH_TABS.map((entry) => ({
    key: entry.id,
    label:
      entry.id === 'under'
        ? t('home.fresh.under', { amount: formatRupees(money(UNDER_LIMIT)) })
        : t(`home.fresh.${entry.id}`),
    ...(entry.id === 'under'
      ? { sticker: formatRupees(money(UNDER_LIMIT)) }
      : { emoji: entry.emoji ?? '' }),
  }));

  return (
    <View style={styles.module} aria-label={t('home.fresh.label')}>
      <AccentWash />
      <LetteredTitle
        word={t('home.fresh.word')}
        sticker={t('home.fresh.sticker')}
        sub={t('home.fresh.sub')}
      />
      <IconTabs
        tabs={tabs}
        selectedKey={chosen}
        onSelect={(key) => {
          setChosen(key as FreshTabId);
        }}
        label={t('home.fresh.label')}
      />
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text color="inkMuted">{t('home.fresh.empty')}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {items.map((item) => (
              <ItemTile key={item.id} item={item} width={RAIL_CARD_WIDTH} reserveNote={note} />
            ))}
          </View>
        </ScrollView>
      )}
      <SeeAllButton
        label={t('home.rails.seeAll')}
        title={t('home.fresh.label')}
        onPress={() => {
          const category = tab?.category;
          if (category !== undefined) onSeeAll(category);
          else router.navigate('/categories');
        }}
      />
    </View>
  );
}
