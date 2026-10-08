import { SplashScreen, Stack } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as NativeStatusBar } from 'react-native';
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
        header: ({ navigation, options }) => (
          <AppHeader
            title={options.title ?? ''}
            backLabel={t('common.back')}
            onBack={navigation.goBack}
          />
        ),
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* Home draws its own tinted header (HomeHeader), so the status bar area takes its colour. */}
      <Stack.Screen name="index" options={{ title: t('app.name'), headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: t('profile.title') }} />
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
      {/* Each header sets its own text colour, since the home header's tint changes with the theme. */}
      <StatusBar style="light" />
      {/* Draw under the status bar on phones that do not do it by themselves, so the header's colour reaches the top edge. */}
      <NativeStatusBar translucent backgroundColor="transparent" />
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
