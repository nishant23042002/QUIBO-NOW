import { SplashScreen, Stack } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageProvider';
import { ThemeProvider, useTheme } from '@/theme';
import { AppHeader, AppSplash } from '@/ui';

// Keep Expo's own splash up until our animated one is on screen, so nothing flashes in between.
// There is nothing to keep on the web or in Expo Go, which is fine.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Screens() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        // Our own header, so its height never depends on when the phone reports the status bar.
        header: ({ back, navigation, options }) =>
          back === undefined ? (
            <AppHeader logoLabel={t('app.name')} />
          ) : (
            <AppHeader
              title={options.title ?? ''}
              backLabel={t('common.back')}
              onBack={navigation.goBack}
            />
          ),
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('app.name') }} />
      <Stack.Screen name="components" options={{ title: t('components.title') }} />
    </Stack>
  );
}

/** Wait for the saved theme and language, so the first screen is drawn once, in the right look. */
function Gate() {
  const theme = useTheme();
  const language = useLanguage();
  const ready = theme.ready && language.ready;

  return <AppSplash ready={ready}>{ready ? <Screens /> : null}</AppSplash>;
}

/** The status bar and the navigation buttons stay readable on whatever is drawn behind them. */
function SystemBars() {
  const { scheme } = useTheme();
  return (
    <>
      {/* The header is dark in both themes, so the status bar text is always light. */}
      <StatusBar style="light" />
      {/* Behind the navigation buttons is the page: a light bar with dark buttons, or the reverse. */}
      <NavigationBar style={scheme === 'dark' ? 'dark' : 'light'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SystemBars />
        <Gate />
      </LanguageProvider>
    </ThemeProvider>
  );
}
