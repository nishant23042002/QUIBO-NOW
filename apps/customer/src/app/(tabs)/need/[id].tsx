import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { need as needById } from '@/home/needs';
import { NeedView } from '@/home/NeedView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { BOTTOM_BAR_HEIGHT, Button, CategoryHeader, Icon, Text, space, useLastParam } from '@/ui';

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

/** A need's page, picked by the id in the address. An id that matches no need gets a way back to Home instead. */
export default function NeedScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  // Kept while the screen slides away, so going back never flashes the "not found" page.
  const id = useLastParam(params.id);
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const found = needById(id);

  if (found !== undefined) return <NeedView need={found} />;

  return (
    <View style={styles.page}>
      <CategoryHeader
        title=""
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />
      <View style={styles.missing}>
        <Icon name="grid" color={colors.inkMuted} size={40} />
        <Text variant="heading" align="center">
          {t('needs.notFound.title')}
        </Text>
        <Text color="inkMuted" align="center">
          {t('needs.notFound.body')}
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
