import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BrandView } from '@/home/BrandView';
import { itemsOfBrand } from '@/home/brandPage';
import { useHomeItems } from '@/home/items';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { AppHeader, BOTTOM_BAR_HEIGHT, Button, Icon, Text, space, useLastParam } from '@/ui';

const styles = StyleSheet.create({
  page: { flex: 1 },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    padding: space[6],
    paddingBottom: space[6] + BOTTOM_BAR_HEIGHT,
  },
});

/** A brand's page. The brand is picked by the id in the address; an id that matches no brand with items gets a way back instead. */
export default function BrandScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  // Kept while the screen slides away, so going back never flashes the "not found" page.
  const id = useLastParam(params.id);
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const items = itemsOfBrand(useHomeItems(), id ?? '');
  const brand = items[0]?.brand;

  const header = (title: string) => (
    <AppHeader
      title={title}
      backLabel={t('common.back')}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
    />
  );

  if (brand === undefined) {
    return (
      <View style={styles.page}>
        {header('')}
        <View style={styles.missing}>
          <Icon name="store" color={colors.inkMuted} size={40} />
          <Text variant="heading" align="center">
            {t('brandPage.notFound.title')}
          </Text>
          <Text color="inkMuted" align="center">
            {t('brandPage.notFound.body')}
          </Text>
          <Button
            label={t('brandPage.notFound.back')}
            onPress={() => {
              router.replace('/');
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {header(brand.name)}
      <BrandView brandId={brand.id} />
    </View>
  );
}
