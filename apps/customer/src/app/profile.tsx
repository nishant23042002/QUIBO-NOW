import { LOCALES, messages } from '@quibo/i18n';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type Mode } from '@/theme';
import { armFailNext, setSimulatedOffline, useFailNextArmed, useSimulatedOffline } from '@/network';
import { Button, OptionGroup, Screen } from '@/ui';

const MODES: readonly Mode[] = ['system', 'light', 'dark'];

// The profile screen holds the settings. For now: language and appearance. Orders, addresses and help join later.
export default function ProfileScreen() {
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const offline = useSimulatedOffline();
  const failArmed = useFailNextArmed();

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
      {/* The components gallery and the network switches are for developers and testers: only development builds show them. */}
      {__DEV__ ? (
        <>
          <OptionGroup
            title={t('profile.dev.network')}
            options={[
              { value: 'online', label: t('profile.dev.online') },
              { value: 'offline', label: t('profile.dev.offline') },
            ]}
            value={offline ? 'offline' : 'online'}
            onChange={(value) => {
              setSimulatedOffline(value === 'offline');
            }}
          />
          <Button
            label={failArmed ? t('profile.dev.failArmed') : t('profile.dev.fail')}
            variant="secondary"
            disabled={failArmed}
            onPress={armFailNext}
          />
          <Button
            label={t('components.title')}
            variant="secondary"
            onPress={() => {
              router.push('/components');
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}
