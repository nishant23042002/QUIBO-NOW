import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageProvider';
import { colors } from '@/ui';

function Screens() {
  const { t } = useLanguage();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('app.name') }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="dark" />
      <Screens />
    </LanguageProvider>
  );
}
