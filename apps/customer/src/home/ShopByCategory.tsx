import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { CategoryTileGrid, RowTitle, SeeAllButton, space } from '@/ui';
import { categoryRoute } from './categoryLists';
import { useCategoryTiles } from './useCategoryTiles';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
});

/**
 * "Shop by category" at the top of Home's rows (ADR 0044, ADR 0046): up to eight tiles in rows of four, under the same dotted-line
 * title the rows have, and an "All categories" button under them that opens the Categories tab. A live category opens its own
 * screen; one that is coming is softened, carries its tag and opens its "Coming to Roha" page.
 */
export function ShopByCategory() {
  const { t } = useLanguage();
  const router = useRouter();
  const tiles = useCategoryTiles();
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
          if (tile !== undefined) router.push(categoryRoute(tile.category));
        }}
      />
      <SeeAllButton
        label={t('categoriesTab.all')}
        title={title}
        onPress={() => {
          router.navigate('/categories');
        }}
      />
    </View>
  );
}
