import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { BottomBar } from '@/ui';

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
  const active = state.routes[state.index]?.name ?? 'index';

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
        if (key !== active && !event.defaultPrevented) navigation.navigate(route.name);
      }}
    />
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <Bar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}
