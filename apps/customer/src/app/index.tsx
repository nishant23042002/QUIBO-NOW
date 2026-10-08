import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Screen, Text } from '@/ui';

// Phase 0 placeholder. The real home (your shops, categories, reorder strip) is Phase 1.
export default function HomeScreen() {
  const { t } = useLanguage();

  return (
    <Screen>
      <LanguageSwitcher />
      <Text variant="title">{t('home.title')}</Text>
      <Text variant="lead">{t('home.subtitle')}</Text>
      <Text>{t('home.windowNote')}</Text>
    </Screen>
  );
}
