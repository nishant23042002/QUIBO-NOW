import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { RowTitle, ShopInfoCard, space } from '@/ui';
import { useSampleShops } from './sampleShops';

const styles = StyleSheet.create({
  section: { gap: space[3] },
  pad: { paddingHorizontal: space[4] },
  row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
});

/**
 * "Shops in your town": the shops the order can come from, in one swipeable row of the same compact shop cards the header's shops
 * panel uses, under the same dotted-line title as every row. There are only a handful, so the row is the whole list and has no
 * "See all". A card opens that shop's page.
 */
export function ShopsStrip() {
  const { t } = useLanguage();
  const router = useRouter();
  const shops = useSampleShops();

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.shopsStrip.title')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {shops.map(({ id, ...shop }) => (
            <ShopInfoCard
              key={id}
              {...shop}
              onPress={() => {
                router.push({ pathname: '/shop/[id]', params: { id } });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
