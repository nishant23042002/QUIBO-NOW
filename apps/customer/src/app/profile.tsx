import { LOCALES, messages } from '@quibo/i18n';
import { useRouter } from 'expo-router';
import { setConditions, useConditions } from '@/home/conditions';
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
  const conditions = useConditions();

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
          <OptionGroup
            title={t('profile.dev.festival')}
            options={[
              { value: 'off', label: t('profile.dev.festivalOff') },
              { value: 'on', label: t('profile.dev.festivalOn') },
            ]}
            value={conditions.festival ? 'on' : 'off'}
            onChange={(value) => {
              setConditions({ festival: value === 'on' });
            }}
          />
          <OptionGroup
            title={t('profile.dev.rain')}
            options={[
              { value: 'dry', label: t('profile.dev.dry') },
              { value: 'rain', label: t('profile.dev.raining') },
            ]}
            value={conditions.rain ? 'rain' : 'dry'}
            onChange={(value) => {
              setConditions({ rain: value === 'rain' });
            }}
          />
          <OptionGroup
            title={t('profile.dev.rush')}
            options={[
              { value: 'clock', label: t('profile.dev.byClock') },
              { value: 'rush', label: t('profile.dev.rushNow') },
            ]}
            value={conditions.rush ? 'rush' : 'clock'}
            onChange={(value) => {
              setConditions({ rush: value === 'rush' });
            }}
          />
          <OptionGroup
            title={t('profile.dev.store')}
            options={[
              { value: 'partner', label: t('profile.dev.partnerShops') },
              { value: 'dark', label: t('profile.dev.darkStore') },
            ]}
            value={conditions.store}
            onChange={(value) => {
              setConditions({ store: value });
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
