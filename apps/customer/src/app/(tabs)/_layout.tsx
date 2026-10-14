import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { Easing } from 'react-native';
import { useCart } from '@/home/CartProvider';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import {
  BottomBar,
  LogoStacked,
  TRAILING_WIDTH,
  showChrome,
  useKeyboardVisible,
  useReduceMotion,
} from '@/ui';
import { NAV_STYLE } from '@/ui/logic/navBar';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** The four main screens, in the order of the bottom bar. `name` is the route's file name. Order again lives inside Orders. */
const TABS = [
  { name: 'index', icon: 'home', label: 'nav.home' },
  { name: 'categories', icon: 'grid', label: 'nav.categories' },
  { name: 'cart', icon: 'cart', label: 'nav.cart' },
  { name: 'orders', icon: 'receipt', label: 'nav.orders' },
] as const;

/** The steps after the cart are reached from it, so the Cart tab stays lit while they show. */
const STEP_OF_CART: readonly string[] = ['checkout', 'schedule', 'coupons'];

/** One order's page is reached from the Orders tab, so that tab stays lit while it shows. */
const STEP_OF_ORDERS: readonly string[] = ['order'];

/** The address pages are reached from Home and from the cart alike, so no tab is lit for them. */
const NEUTRAL: readonly string[] = ['address', 'address-edit', 'help', 'report'];

/**
 * The tabs other than Home are built in the background one after another once Home has settled, so the first tap on each only
 * switches to a screen that is already there. They are built one at a time, with a pause, so building one never shows up as a
 * stutter on Home. (Frozen while out of front, they cost nothing more.)
 */
const WARM_ORDER: readonly string[] = ['cart', 'orders', 'categories'];
const WARM_FIRST_MS = 900;
const WARM_NEXT_MS = 450;
const WARM_IDLE_LIMIT_MS = 2000;

/**
 * Moving from one screen to another is a cross-fade: the screen leaving fades out as the one arriving fades in, on the animation
 * thread, so it stays smooth while the phone is busy drawing the new screen. The bottom bar and the cart bar sit outside it and do
 * not move. It uses the bottom bar's own curve.
 */
const SCREEN_FADE = {
  animation: 'timing',
  config: { duration: 220, easing: Easing.bezier(0.4, 0, 0.2, 1) },
} as const;

function Bar({ state, navigation }: TabBarProps) {
  const { t } = useLanguage();
  const cart = useCart();
  const keyboard = useKeyboardVisible();
  const current = state.routes[state.index]?.name ?? 'index';
  // A shop, an item's page and search are reached from Home and have no tab of their own, so Home stays the lit one while
  // they show. The pages after the cart (schedule, coupons, address, checkout) keep the Cart tab lit.
  const active = TABS.some((tab) => tab.name === current)
    ? current
    : STEP_OF_CART.includes(current)
      ? 'cart'
      : STEP_OF_ORDERS.includes(current)
        ? 'orders'
        : NEUTRAL.includes(current)
          ? 'none'
          : 'index';

  // A new screen starts with the bar in place, whatever the last one had scrolled.
  useEffect(() => {
    showChrome();
  }, [current]);

  // While the keyboard is up the bar would only ride on top of it, so it steps aside.
  if (keyboard) return null;

  return (
    <BottomBar
      tabs={TABS.map((tab) => ({
        key: tab.name,
        label: t(tab.label),
        icon: tab.icon,
        ...(tab.name === 'cart' && cart.count > 0
          ? {
              badge: cart.count,
              accessibilityLabel: `${t(tab.label)}, ${cart.itemsLabel}`,
            }
          : {}),
      }))}
      activeKey={active}
      trailing={<LogoStacked width={TRAILING_WIDTH - 16} ground="chrome" label={t('app.name')} />}
      onSelect={(key) => {
        const route = state.routes.find((candidate) => candidate.name === key);
        if (route === undefined) return;
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (key !== current && !event.defaultPrevented) navigation.navigate(route.name);
      }}
    />
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  // The cross-fade is part of the lively look (`NAV_STYLE`), and is left out with "reduce motion" on.
  const fade = NAV_STYLE === 'lively' && !reduceMotion;
  const [warmed, setWarmed] = useState(0);

  useEffect(() => {
    if (warmed >= WARM_ORDER.length) return undefined;
    let idle: number | undefined;
    // After a pause, and then only when the phone has nothing else to do (but within two seconds), build the next tab.
    const timer = setTimeout(
      () => {
        idle = requestIdleCallback(
          () => {
            setWarmed((count) => count + 1);
          },
          { timeout: WARM_IDLE_LIMIT_MS },
        );
      },
      warmed === 0 ? WARM_FIRST_MS : WARM_NEXT_MS,
    );
    return () => {
      clearTimeout(timer);
      if (idle !== undefined) cancelIdleCallback(idle);
    };
  }, [warmed]);

  return (
    <Tabs
      tabBar={(props) => <Bar {...props} />}
      backBehavior="history"
      // A screen that is not in front is frozen: it keeps what it shows and its place, but is not drawn again each time the cart,
      // the clock or a timer changes something. Without this every screen visited so far was redrawn behind the one in view.
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        freezeOnBlur: true,
        animation: fade ? 'fade' : 'none',
        ...(fade ? { transitionSpec: SCREEN_FADE } : {}),
      }}
    >
      {TABS.map((tab) => {
        const order = WARM_ORDER.indexOf(tab.name);
        // Built on the first visit, until its turn to be built early has come.
        const lazy = !(order >= 0 && order < warmed);
        return <Tabs.Screen key={tab.name} name={tab.name} options={{ lazy }} />;
      })}
      {/* A shop's page lives in the tab group so the bottom bar stays, but it is not a tab: href null hides it from the bar. */}
      <Tabs.Screen name="shop/[id]" options={{ href: null }} />
      {/* A brand's page, the same: reached from an item's page, with the bottom bar kept (ADR 0036). */}
      <Tabs.Screen name="brand/[id]" options={{ href: null }} />
      {/* A main category's screen (a rail of its kinds, filters and a grid), reached from the Categories tab and Home, with the bar kept. */}
      <Tabs.Screen name="category/[id]" options={{ href: null }} />
      {/* The "Coming to Roha" page of a category that is not stocked yet, with the bar kept (ADR 0046). */}
      <Tabs.Screen name="coming/[id]" options={{ href: null }} />
      {/* A need's page ("Tea time"), reached from Home's "Picks for your routine", with the bar kept. */}
      <Tabs.Screen name="need/[id]" options={{ href: null }} />
      {/* An item's page, the same: reached from a card, with the bottom bar kept. */}
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
      {/* The search screen is the same: reached from the search bar on Home, with the bottom bar kept. */}
      <Tabs.Screen name="search" options={{ href: null }} />
      {/* Checkout follows the cart: part of its flow, with the bottom bar kept and the Cart tab lit. */}
      <Tabs.Screen name="checkout" options={{ href: null }} />
      {/* Choosing when the order arrives is a step of the cart, the same way. */}
      <Tabs.Screen name="schedule" options={{ href: null }} />
      {/* Coupons are opened from the cart the same way. */}
      <Tabs.Screen name="coupons" options={{ href: null }} />
      {/* The address page is opened from the cart the same way. */}
      <Tabs.Screen name="address" options={{ href: null }} />
      {/* Adding or changing one is a step of it. */}
      <Tabs.Screen name="address-edit" options={{ href: null }} />
    </Tabs>
  );
}
