import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useShop } from '@/home/sampleShops';
import { ShopView } from '@/home/ShopView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { AppHeader, BOTTOM_BAR_HEIGHT, Button, Icon, Text, space } from '@/ui';

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

/** A shop's page. The shop is picked by the id in the address; an id that matches no shop gets a way back instead. */
export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const shop = useShop(id);

  const header = (title: string) => (
    <AppHeader title={title} backLabel={t('common.back')} onBack={router.back} />
  );

  if (shop === undefined) {
    return (
      <View style={styles.page}>
        {header('')}
        <View style={styles.missing}>
          <Icon name="store" color={colors.inkMuted} size={40} />
          <Text variant="heading" align="center">
            {t('shop.notFound.title')}
          </Text>
          <Text color="inkMuted" align="center">
            {t('shop.notFound.body')}
          </Text>
          <Button
            label={t('shop.notFound.back')}
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
      {header(shop.name)}
      <ShopView shop={shop} />
    </View>
  );
}
