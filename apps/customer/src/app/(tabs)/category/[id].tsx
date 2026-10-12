import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { mainCategory } from '@/home/catalogueTree';
import { CategoryView } from '@/home/CategoryView';
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

/**
 * A main category's screen, picked by the id in the address, with an optional `sub` (a sub-category to open on). An id that matches
 * no category gets a way back to the Categories tab instead.
 */
export default function CategoryScreen() {
  const { id, sub } = useLocalSearchParams<{ id: string; sub?: string }>();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const main = mainCategory(id);

  if (main === undefined) {
    return (
      <View style={styles.page}>
        <AppHeader
          title=""
          backLabel={t('common.back')}
          onBack={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/categories');
          }}
        />
        <View style={styles.missing}>
          <Icon name="grid" color={colors.inkMuted} size={40} />
          <Text variant="heading" align="center">
            {t('catalogue.notFound.title')}
          </Text>
          <Text color="inkMuted" align="center">
            {t('catalogue.notFound.body')}
          </Text>
          <Button
            label={t('catalogue.notFound.back')}
            onPress={() => {
              router.replace('/categories');
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <CategoryView
      key={`${main.id}:${sub ?? ''}`}
      main={main}
      {...(sub !== undefined ? { initialSub: sub } : {})}
    />
  );
}
