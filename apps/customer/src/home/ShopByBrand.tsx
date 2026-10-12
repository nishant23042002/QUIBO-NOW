import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { BrandTile, RowTitle, space } from '@/ui';
import { brandsOfItems } from './brandPage';
import { useHomeItems } from './items';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
  row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
});

/**
 * "Shop by brand" (ADR 0036): the brands that have items here, in one swipeable row of tiles under the same dotted-line title as every
 * row. There are only a dozen, so the row is the whole list and has no "See all". A tile opens the brand's page. A brand with no
 * items is never shown, and a town with no branded items shows no row at all.
 */
export function ShopByBrand() {
  const { t } = useLanguage();
  const router = useRouter();
  const brands = brandsOfItems(useHomeItems());
  if (brands.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.shopByBrand.title')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {brands.map((brand) => (
            <BrandTile
              key={brand.id}
              brandId={brand.id}
              mark={brand.mark}
              name={brand.name}
              label={`${brand.name}. ${t('product.exploreAll')}`}
              onPress={() => {
                router.push({ pathname: '/brand/[id]', params: { id: brand.id } });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
