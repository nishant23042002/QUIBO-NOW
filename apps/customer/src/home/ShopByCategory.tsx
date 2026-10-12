import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { CategoryTileGrid, RowTitle, SeeAllButton, space } from '@/ui';
import { tileRoute } from './categoryGroups';
import type { ItemCategory } from './items';
import { useHomeCategoryTiles } from './useCategoryTiles';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
});

/**
 * "Shop by category" at the top of Home's rows: eight tiles in two rows of four, under the same dotted-line title the rows have, and a
 * "See all" button under them that opens the Categories tab. A main category switches Home to its tab in place (no new screen); a finer
 * tile opens search for its word.
 */
export function ShopByCategory({ onCategory }: { onCategory: (category: ItemCategory) => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const tiles = useHomeCategoryTiles();
  const title = t('home.shopByCategory.title');

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={title} />
      </View>
      <CategoryTileGrid
        tiles={tiles}
        onPress={(index) => {
          const tile = tiles[index];
          if (tile === undefined) return;
          if (tile.target.kind === 'category') onCategory(tile.target.category);
          else router.push(tileRoute(tile.target, String(Date.now())));
        }}
      />
      <SeeAllButton
        label={t('home.rails.seeAll')}
        title={title}
        onPress={() => {
          router.navigate('/categories');
        }}
      />
    </View>
  );
}
