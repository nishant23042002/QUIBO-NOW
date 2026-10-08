import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { Button, Screen, Text } from '@/ui';

// Phase 0 placeholder. The real home (your shops, categories, reorder strip) is Phase 1.
export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <Screen>
      <LanguageSwitcher />
      <Text variant="title">{t('home.title')}</Text>
      <Text variant="lead">{t('home.subtitle')}</Text>
      <Text>{t('home.windowNote')}</Text>
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
