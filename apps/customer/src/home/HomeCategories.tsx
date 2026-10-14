import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { CategoryTileGrid, RowTitle, SeeAllButton, Text, space } from '@/ui';
import { categoryRoute } from './categoryLists';
import { ComingSoonRail } from './ComingSoonRail';
import { subsEmojis } from './subsEmojis';
import { useCategoryGroups } from './useCategoryGroups';
import { useNotify } from './useNotify';

const styles = StyleSheet.create({
  page: { gap: space[6] },
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4], gap: space[1] },
});

/**
 * The categories on Home (ADR 0055, step 5), in the order the mock lays them out: each group the town stocks as a title and a grid
 * of tiles, the group's first category wide with pictures of what it holds, the others four across, and the categories that are
 * coming softened beside them with Notify me; then "Coming soon to Roha" with a card for each group that is only coming; then "All
 * categories", which opens the Categories tab. A live tile opens its own screen. A tile that is coming turns Notify me on and off.
 */
export function HomeCategories() {
  const { t } = useLanguage();
  const router = useRouter();
  const notify = useNotify();
  const groups = useCategoryGroups();
  const stocked = groups.filter((group) => group.live.length > 0);
  const coming = groups.filter((group) => group.live.length === 0);

  return (
    <View style={styles.page}>
      {stocked.map((group) => {
        const tiles = group.tiles.map((tile, index) =>
          index === 0 ? { ...tile, wide: true, emojis: subsEmojis(group.live[0]) } : tile,
        );
        return (
          <View key={group.id} style={styles.section}>
            <View style={styles.pad}>
              <RowTitle title={group.title} />
            </View>
            <CategoryTileGrid
              tiles={tiles}
              onPress={(index) => {
                const tile = group.tiles[index];
                if (tile === undefined) return;
                if (tile.soon === true) notify.toggle(tile.category.id);
                else router.push(categoryRoute(tile.category));
              }}
            />
          </View>
        );
      })}

      {coming.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.pad}>
            <RowTitle title={t('home.comingSoon.title')} />
            <Text variant="small" color="inkMuted">
              {t('home.comingSoon.sub')}
            </Text>
          </View>
          <ComingSoonRail groups={coming} />
        </View>
      ) : null}

      <SeeAllButton
        label={t('categoriesTab.all')}
        title={t('categoriesTab.all')}
        onPress={() => {
          router.navigate('/categories');
        }}
      />
    </View>
  );
}
