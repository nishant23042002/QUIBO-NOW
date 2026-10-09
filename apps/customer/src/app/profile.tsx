import { LOCALES, messages } from '@quibo/i18n';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { setConditions, useConditions } from '@/home/conditions';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from '@/home/loading';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type Mode } from '@/theme';
import { armFailNext, setSimulatedOffline, useFailNextArmed, useSimulatedOffline } from '@/network';
import { useAccount } from '@/account/AccountProvider';
import { formatPhone } from '@/home/phone';
import {
  Button,
  LoadGate,
  OptionGroup,
  ProfileSkeleton,
  Screen,
  Text,
  space,
  useScreenLoad,
} from '@/ui';

const MODES: readonly Mode[] = ['system', 'light', 'dark'];

/** How many choices each settings group has, for the skeleton: language, appearance, then the developer switches. */
const DEV_GROUPS = [2, 2, 2, 2, 2] as const;
/** The developer buttons at the end: "fail the next load" and the components gallery. */
const DEV_BUTTONS = 2;

// The profile screen holds the settings. For now: language and appearance. Orders, addresses and help join later.
export default function ProfileScreen() {
  const load = useScreenLoad({ loadMs: SETTINGS_LOAD_MS, policy: SETTINGS_POLICY });
  const groups = [LOCALES.length, MODES.length, ...(__DEV__ ? DEV_GROUPS : [])];

  return (
    <LoadGate
      load={load}
      skeleton={<ProfileSkeleton groups={groups} buttons={__DEV__ ? DEV_BUTTONS : 0} />}
    >
      <Settings />
    </LoadGate>
  );
}

function Settings() {
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode } = useTheme();
  const router = useRouter();
  const offline = useSimulatedOffline();
  const failArmed = useFailNextArmed();
  const account = useAccount();
  const conditions = useConditions();

  return (
    <Screen>
      {/* Who is signed in, and a way out. A tester who skipped the sign-in has no number to show but can still sign out. */}
      <View style={{ gap: space[2] }}>
        <Text variant="strong" color="inkMuted">
          {t('profile.account')}
        </Text>
        {account.phone !== null ? (
          <Text>{t('profile.signedIn', { phone: formatPhone(account.phone) })}</Text>
        ) : null}
        <Button label={t('profile.logout')} variant="secondary" onPress={account.logOut} />
      </View>
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
