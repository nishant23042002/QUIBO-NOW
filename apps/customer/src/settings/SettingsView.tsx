import { LOCALES, messages } from '@quibo/i18n';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Suspense, lazy, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAccount } from '@/account/AccountProvider';
import { useDeliveryAddress } from '@/home/deliveryInfo';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from '@/home/loading';
import { formatPhone } from '@/home/phone';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type Mode, type ThemeColors } from '@/theme';
import {
  Button,
  Icon,
  LoadGate,
  OptionGroup,
  Screen,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  Text,
  radius,
  space,
  useScreenLoad,
  type IconName,
} from '@/ui';
import { signedInOf, versionOf } from './logic';

const MODES: readonly Mode[] = ['system', 'light', 'dark'];

/**
 * The testing tools, in development builds only. The condition is a constant in a release build, so the bundler drops the import
 * and with it the tools and the components gallery behind them.
 */
const TestingTools = __DEV__ ? lazy(() => import('./TestingTools')) : null;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      overflow: 'hidden',
      borderWidth: 1,
      borderRadius: radius.lg,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    account: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4] },
    avatar: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.accentSubtle,
    },
    grow: { flex: 1, minWidth: 0 },
    logout: { minWidth: 112 },
    row: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[2],
    },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    footer: { alignItems: 'center', paddingTop: space[2] },
    testing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[4],
      borderWidth: 1,
      borderRadius: radius.lg,
      borderColor: c.warning,
      backgroundColor: c.warningBg,
    },
    fill: { flex: 1, overflow: 'hidden' },
    skeletonColumn: { gap: space[6] },
    skeletonGroup: { gap: space[2] },
    skeletonRow: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
    },
  });

/** Grey blocks in the shape of the page: the account card, the three shortcuts, language, appearance and, for testers, one card. */
function SettingsSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const row = (key: number, divided: boolean) => (
    <View key={key} style={[styles.skeletonRow, divided && styles.divided]}>
      <Skeleton width={24} height={24} rounded={radius.full} />
      <View style={styles.grow}>
        <SkeletonLine size="base" width="50%" />
      </View>
    </View>
  );
  return (
    <SkeletonScope label={t('common.loading')} style={styles.fill}>
      <Screen>
        <View style={styles.skeletonColumn}>
          <View style={[styles.card, styles.account]}>
            <Skeleton width={44} height={44} rounded={radius.full} />
            <View style={styles.grow}>
              <SkeletonLine size="base" width="45%" />
              <SkeletonLine size="sm" width="30%" />
            </View>
            <Skeleton width={112} height={48} rounded={radius.md} />
          </View>
          <View style={styles.card}>{[0, 1, 2].map((index) => row(index, index > 0))}</View>
          {[0, 1].map((group) => (
            <View key={group} style={styles.skeletonGroup}>
              <SkeletonLine size="sm" width={`${28 + group * 8}%`} />
              <View style={styles.card}>{[0, 1, 2].map((index) => row(index, index > 0))}</View>
            </View>
          ))}
          {__DEV__ ? <Skeleton height={64} rounded={radius.lg} /> : null}
        </View>
      </Screen>
    </SkeletonScope>
  );
}

function Shortcut({
  icon,
  title,
  sub,
  divided,
  onPress,
}: {
  icon: IconName;
  title: string;
  sub?: string | undefined;
  divided: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      role="link"
      onPress={onPress}
      style={({ pressed }) => [styles.row, divided && styles.divided, pressed && { opacity: 0.85 }]}
    >
      <Icon name={icon} color={colors.accentInk} size={22} />
      <View style={styles.grow}>
        <Text variant="label">{title}</Text>
        {sub !== undefined ? (
          <Text variant="small" color="inkMuted" numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Icon name="chevronRight" color={colors.inkMuted} size={18} />
    </Pressable>
  );
}

function Settings() {
  const { locale, setLocale, t } = useLanguage();
  const { mode, setMode, colors } = useTheme();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const account = useAccount();
  const address = useDeliveryAddress();
  const [toolsOpen, setToolsOpen] = useState(false);
  const signedIn = signedInOf(account.phone);
  const version = versionOf(Constants.expoConfig?.version);

  return (
    <Screen>
      <View style={styles.card}>
        <View style={styles.account}>
          <View style={styles.avatar} aria-hidden>
            <Icon name="user" color={colors.accentInk} size={22} />
          </View>
          <View style={styles.grow}>
            <Text variant="label">
              {signedIn.kind === 'number'
                ? formatPhone(signedIn.phone)
                : t('settings.skippedTitle')}
            </Text>
            <Text variant="small" color="inkMuted">
              {signedIn.kind === 'number' ? t('settings.signedIn') : t('settings.skipped')}
            </Text>
          </View>
          <View style={styles.logout}>
            <Button label={t('profile.logout')} variant="secondary" onPress={account.logOut} />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Shortcut
          icon="pin"
          title={t('settings.addresses')}
          sub={address}
          divided={false}
          onPress={() => {
            router.push('/address');
          }}
        />
        <Shortcut
          icon="receipt"
          title={t('settings.orders')}
          divided
          onPress={() => {
            router.navigate('/orders');
          }}
        />
        <Shortcut
          icon="info"
          title={t('help.title')}
          divided
          onPress={() => {
            router.push('/help');
          }}
        />
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

      {TestingTools !== null ? (
        <View style={{ gap: space[6] }}>
          <Pressable
            role="button"
            aria-expanded={toolsOpen}
            onPress={() => {
              setToolsOpen((open) => !open);
            }}
            style={styles.testing}
          >
            <Icon name="sparkle" color={colors.warning} size={22} />
            <View style={styles.grow}>
              <Text variant="label" color="warning">
                {t('settings.testing')}
              </Text>
              <Text variant="small" color="warning">
                {t('settings.testingSub')}
              </Text>
            </View>
            <Icon name={toolsOpen ? 'minus' : 'plus'} color={colors.warning} size={20} />
          </Pressable>
          {toolsOpen ? (
            <Suspense fallback={null}>
              <TestingTools />
            </Suspense>
          ) : null}
        </View>
      ) : null}

      {version !== null ? (
        <View style={styles.footer}>
          <Text variant="small" color="inkMuted">
            {t('settings.version', { version })}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

/** The Settings screen: the account, shortcuts to addresses, orders and help, language and appearance, and the testing tools. */
export function SettingsView() {
  const load = useScreenLoad({ loadMs: SETTINGS_LOAD_MS, policy: SETTINGS_POLICY });
  return (
    <LoadGate load={load} skeleton={<SettingsSkeleton />}>
      <Settings />
    </LoadGate>
  );
}
