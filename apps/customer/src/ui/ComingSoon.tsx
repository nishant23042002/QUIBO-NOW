import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { AppHeader } from './AppHeader';
import { Screen } from './Screen';
import { Text } from './Text';
import { BOTTOM_BAR_HEIGHT, space } from './tokens';

const styles = StyleSheet.create({
  page: { flex: 1 },
  body: { gap: space[2], paddingBottom: BOTTOM_BAR_HEIGHT },
});

/** A stand-in for a main screen that is built in a later section: its header and one line saying so. */
export function ComingSoon({ title }: { title: string }) {
  const { t } = useLanguage();

  return (
    <View style={styles.page}>
      <AppHeader title={title} />
      <Screen>
        <View style={styles.body}>
          <Text variant="heading">{title}</Text>
          <Text color="inkMuted">{t('nav.soon')}</Text>
        </View>
      </Screen>
    </View>
  );
}
