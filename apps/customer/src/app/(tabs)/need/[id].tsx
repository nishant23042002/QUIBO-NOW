import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { need as needById } from '@/home/needs';
import { NeedView } from '@/home/NeedView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { BOTTOM_BAR_HEIGHT, Button, CategoryHeader, Icon, Text, space } from '@/ui';

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
  const { id } = useLocalSearchParams<{ id: string }>();
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
          {t('departments.needNotFound.title')}
        </Text>
        <Text color="inkMuted" align="center">
          {t('departments.needNotFound.body')}
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
