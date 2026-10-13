import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { CategoryTileGrid, RowTitle, SeeAllButton, space } from '@/ui';
import { categoryRoute } from './categoryLists';
import { useDepartmentTiles } from './useDepartmentTiles';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
});

/**
 * "Shop by department" at the top of Home's rows (ADR 0044): up to eight tiles in rows of four, under the same dotted-line title the
 * rows have, and an "All departments" button under them. A live department opens the screen of the main category it holds; one that
 * is coming is softened, carries its tag and opens its "Coming to Roha" page.
 */
export function ShopByDepartment() {
  const { t } = useLanguage();
  const router = useRouter();
  const tiles = useDepartmentTiles();
  const title = t('home.shopByDepartment.title');

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
        label={t('departments.all')}
        title={title}
        onPress={() => {
          router.push('/departments');
        }}
      />
    </View>
  );
}
