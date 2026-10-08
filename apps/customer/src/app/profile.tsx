import { LOCALES, messages } from '@quibo/i18n';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type Mode } from '@/theme';
import { Button, OptionGroup, Screen } from '@/ui';

const MODES: readonly Mode[] = ['system', 'light', 'dark'];

// The profile screen holds the settings. For now: language and appearance. Orders, addresses and help join later.
export default function ProfileScreen() {
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode } = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <OptionGroup
        title={t('language.label')}
        options={LOCALES.map((value) => ({ value, label: messages[value].language[value] }))}
        value={locale}
        onChange={setLocale}
      />
      <OptionGroup
        title={t('profile.appearance')}
        options={MODES.map((value) => ({ value, label: t(`theme.${value}`) }))}
        value={mode}
        onChange={setMode}
      />
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
