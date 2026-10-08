import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageProvider';
import { ThemeProvider, useTheme } from '@/theme';
import { Boot, HeaderLogo, ThemeToggle } from '@/ui';

function Screens() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.chrome },
        headerTintColor: colors.onChrome,
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        contentStyle: { backgroundColor: colors.bg },
        headerRight: () => <ThemeToggle />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('app.name'),
          headerTitle: () => <HeaderLogo label={t('app.name')} />,
        }}
      />
      <Stack.Screen name="components" options={{ title: t('components.title') }} />
    </Stack>
  );
}

/** Wait for the saved theme and language, so the first screen is drawn once, in the right look. */
function Gate() {
  const theme = useTheme();
  const language = useLanguage();

  if (!theme.ready || !language.ready) return <Boot />;
  return <Screens />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {/* The header is dark in both themes, so the status bar text is always light. */}
        <StatusBar style="light" />
        <Gate />
      </LanguageProvider>
    </ThemeProvider>
  );
}
