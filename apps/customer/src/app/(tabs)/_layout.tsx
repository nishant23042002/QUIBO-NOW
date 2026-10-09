import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { BottomBar, useKeyboardVisible } from '@/ui';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** The four main screens, in the order of the bottom bar. `name` is the route's file name. */
const TABS = [
  { name: 'index', icon: 'home', label: 'nav.home' },
  { name: 'again', icon: 'repeat', label: 'nav.again' },
  { name: 'categories', icon: 'grid', label: 'nav.categories' },
  { name: 'orders', icon: 'receipt', label: 'nav.orders' },
] as const;

function Bar({ state, navigation }: TabBarProps) {
  const { t } = useLanguage();
  const keyboard = useKeyboardVisible();
  const current = state.routes[state.index]?.name ?? 'index';
  // A shop page is reached from Home and has no tab of its own, so Home stays the lit one while it shows.
  const active = TABS.some((tab) => tab.name === current) ? current : 'index';

  // While the keyboard is up the bar would only ride on top of it, so it steps aside.
  if (keyboard) return null;

  return (
    <BottomBar
      tabs={TABS.map((tab) => ({ key: tab.name, label: t(tab.label), icon: tab.icon }))}
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
      {/* The cart is the same: opened from the cart bar, with the bottom bar kept and Home lit. */}
      <Tabs.Screen name="cart" options={{ href: null }} />
    </Tabs>
  );
}
