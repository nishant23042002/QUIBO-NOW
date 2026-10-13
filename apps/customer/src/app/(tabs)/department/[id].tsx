import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ComingToRohaView } from '@/home/ComingToRohaView';
import { categoryRoute, isLive, resolveCategories } from '@/home/categoryLists';
import { useHomeItems } from '@/home/items';
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

/**
 * A department's own page, picked by the id in the address. One that is coming shows "Coming to Roha"; a live one has a shelf, so it
 * goes there; an id that matches none gets a way back to All departments.
 */
export default function DepartmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  // As the shopper sees it: a live department with nothing in stock reads as coming, so it is never sent to an empty shelf.
  const found = resolveCategories(useHomeItems()).find((entry) => entry.id === id);

  if (found !== undefined && isLive(found)) {
    return <Redirect href={categoryRoute(found)} />;
  }
  if (found !== undefined) return <ComingToRohaView department={found} />;

  return (
    <View style={styles.page}>
      <CategoryHeader
        title=""
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/departments');
        }}
      />
      <View style={styles.missing}>
        <Icon name="grid" color={colors.inkMuted} size={40} />
        <Text variant="heading" align="center">
          {t('departments.notFound.title')}
        </Text>
        <Text color="inkMuted" align="center">
          {t('departments.notFound.body')}
        </Text>
        <Button
          label={t('departments.all')}
          onPress={() => {
            router.replace('/departments');
          }}
        />
      </View>
    </View>
  );
}
