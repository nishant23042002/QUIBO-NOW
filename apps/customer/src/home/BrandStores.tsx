import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { BrandTile, Button, RowTitle, Text, radius, space } from '@/ui';
import { brandsOfItems, itemsOfBrand } from './brandPage';
import { anyCardNote, useHomeItems } from './items';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';

/** The most cards one brand's store shows before "Explore the store". */
const STORE_MOST = 8;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4], gap: space[1] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    // The chosen brand's store: a soft block under the row of brands.
    store: {
      marginHorizontal: space[4],
      paddingVertical: space[3],
      gap: space[3],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.lilac,
      overflow: 'hidden',
    },
    storeHead: { paddingHorizontal: space[3], gap: 2 },
    storeRow: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[3] },
    storeAction: { paddingHorizontal: space[3] },
  });

/**
 * "Shop by brand" with brand stores (ADR 0036, ADR 0055 step 7): the brands that have items here in one swipeable row of tiles, and
 * under it the store of the chosen one: its name, how many things it has, a row of its cards and "Explore the store", which opens
 * the brand's own page. A brand with no items is never shown, and a town with no branded items shows no row at all.
 */
export function BrandStores() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const brands = brandsOfItems(items);
  const [chosenId, setChosenId] = useState<string | undefined>(undefined);
  if (brands.length === 0) return null;

  const chosen = brands.find((brand) => brand.id === chosenId) ?? brands[0];
  if (chosen === undefined) return null;
  const list = itemsOfBrand(items, chosen.id)
    .filter((item) => item.stock?.kind !== 'out')
    .slice(0, STORE_MOST);
  const note = anyCardNote(list);

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.shopByBrand.title')} />
        <Text variant="small" color="inkMuted">
          {t('home.shopByBrand.sub')}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {brands.map((brand) => (
            <BrandTile
              key={brand.id}
              brandId={brand.id}
              mark={brand.mark}
              name={brand.name}
              label={`${brand.name}. ${t('home.shopByBrand.open')}`}
              selected={brand.id === chosen.id}
              onPress={() => {
                setChosenId(brand.id);
              }}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.store}>
        <View style={styles.storeHead}>
          <Text variant="heading" role="heading">
            {chosen.name}
          </Text>
          <Text variant="small" color="inkMuted">
            {t('home.shopByBrand.count', { count: chosen.count })}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.storeRow}>
            {list.map((item) => (
              <ItemTile key={item.id} item={item} width={RAIL_CARD_WIDTH} reserveNote={note} />
            ))}
          </View>
        </ScrollView>
        <View style={styles.storeAction}>
          <Button
            label={t('home.shopByBrand.explore', { name: chosen.name })}
            variant="secondary"
            light
            onPress={() => {
              router.push({ pathname: '/brand/[id]', params: { id: chosen.id } });
            }}
          />
        </View>
      </View>
    </View>
  );
}
