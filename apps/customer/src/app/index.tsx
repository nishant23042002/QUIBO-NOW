import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { Button, LogoStacked, Notice, Screen, Text, space } from '@/ui';

// Phase 0 placeholder. The real home (your shops, categories, reorder strip) is Phase 1.
export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <Screen>
      <LanguageSwitcher />
      <View style={styles.hero}>
        <LogoStacked width={220} ground="page" label={t('app.name')} />
        <Text variant="lead" color="inkMuted">
          {t('app.tagline')}
        </Text>
      </View>
      <View style={styles.copy}>
        <Text variant="heading">{t('home.title')}</Text>
        <Text>{t('home.subtitle')}</Text>
      </View>
      <Notice tone="info" icon="clock" message={t('home.windowNote')} />
      {/* The components gallery is for developers and testers: only development builds link to it. */}
      {__DEV__ ? (
        <Button
          label={t('components.title')}
          variant="secondary"
          onPress={() => {
            router.push('/components');
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'flex-start', gap: space[3] },
  copy: { gap: space[2] },
});
