import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useShop } from '@/home/sampleShops';
import { ShopView } from '@/home/ShopView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { Button, Icon, Text, space } from '@/ui';

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    padding: space[6],
  },
});

/** A shop's page. The shop is picked by the id in the address; an id that matches no shop gets a way back instead. */
export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const shop = useShop(id);

  if (shop === undefined) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: '' }} />
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
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: shop.name }} />
      <ShopView shop={shop} />
    </>
  );
}
