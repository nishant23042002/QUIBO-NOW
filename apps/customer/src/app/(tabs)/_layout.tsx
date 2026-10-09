import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCart } from '@/home/CartProvider';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { BottomBar, useKeyboardVisible } from '@/ui';

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
const NEUTRAL: readonly string[] = ['address', 'address-edit'];

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

  return (
    <Tabs
      tabBar={(props) => <Bar {...props} />}
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
      {/* A shop's page lives in the tab group so the bottom bar stays, but it is not a tab: href null hides it from the bar. */}
      <Tabs.Screen name="shop/[id]" options={{ href: null }} />
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
