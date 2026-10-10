import { SplashScreen, Stack } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as NativeStatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountProvider, useAccount } from '@/account/AccountProvider';
import { FirstRun } from '@/account/FirstRun';
import { Welcome } from '@/account/Welcome';
import { ReportsProvider } from '@/help/ReportsProvider';
import { AddressProvider } from '@/home/AddressProvider';
import { CartProvider } from '@/home/CartProvider';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageProvider';
import { OrderPlaced } from '@/orders/OrderPlaced';
import { OrdersProvider, useOrders } from '@/orders/OrdersProvider';
import { ThemeProvider, useTheme } from '@/theme';
import { AppHeader, AppSplash } from '@/ui';

// Keep Expo's own splash up until our animated one is on screen, so nothing flashes in between.
// There is nothing to keep on the web or in Expo Go, which is fine.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Screens() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
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
        {/* The tabs draw their own headers (Home's is tinted), so the stack shows none for them. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: t('profile.title') }} />
        <Stack.Screen name="components" options={{ title: t('components.title') }} />
      </Stack>
      {/* A solid strip behind the phone's own navigation buttons (or gesture bar), so the page never shows through
          them. It has the colour of the cards, which is also the colour the bottom navigation bar will have. */}
      <View
        pointerEvents="none"
        style={[styles.navStrip, { height: insets.bottom, backgroundColor: colors.surface }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  navStrip: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});

/** Wait for the saved theme and language, so the first screen is drawn once, in the right look. */
function Gate() {
  const theme = useTheme();
  const language = useLanguage();
  const account = useAccount();
  const orders = useOrders();
  const ready = theme.ready && language.ready && account.loaded;

  // Until the shopper has chosen a language and checked their number, the first-run steps are the whole app.
  return (
    <AppSplash ready={ready}>
      {ready ? (
        account.stage === 'done' ? (
          <>
            <Screens />
            {/* Home is drawn underneath from the first frame; the welcome covers it until it has loaded. */}
            {account.welcoming ? <Welcome onDone={account.finishWelcome} /> : null}
            {/* Covers the app for a moment when an order is placed, and opens the Orders tab under it. */}
            {orders.justPlaced !== null ? (
              <OrderPlaced order={orders.justPlaced} onDone={orders.dismissPlaced} />
            ) : null}
          </>
        ) : (
          <FirstRun />
        )
      ) : null}
    </AppSplash>
  );
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
      {/* Behind the navigation buttons is the solid strip in the card colour: dark buttons on the light theme's
          white, light buttons on the dark theme's graphite. (The style names the buttons' colour, not the bar's.) */}
      <NavigationBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SystemBars />
        <AccountProvider>
          <AddressProvider>
            <CartProvider>
              <OrdersProvider>
                <ReportsProvider>
                  <Gate />
                </ReportsProvider>
              </OrdersProvider>
            </CartProvider>
          </AddressProvider>
        </AccountProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
