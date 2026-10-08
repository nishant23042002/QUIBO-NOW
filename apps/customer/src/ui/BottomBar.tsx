import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { BOTTOM_BAR_HEIGHT, radius } from './tokens';

export interface BottomBarTab {
  key: string;
  /** Already translated. */
  label: string;
  icon: IconName;
}

export interface BottomBarProps {
  tabs: readonly BottomBarTab[];
  activeKey: string;
  onSelect: (key: string) => void;
}

const PILL_WIDTH = 56;
const PILL_HEIGHT = 30;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // Laid over the bottom of every tab's screen, solid, with the phone's navigation buttons inside its lower part.
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    tab: {
      flex: 1,
      height: BOTTOM_BAR_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    pill: {
      width: PILL_WIDTH,
      height: PILL_HEIGHT,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillOn: { backgroundColor: c.accentSubtle },
    pressed: { opacity: 0.7 },
  });

/**
 * The bottom navigation bar: one tab for each main screen, the chosen one with a soft pistachio pill behind its
 * icon and its name in full colour. It is solid, and tall enough to hold the phone's own navigation buttons
 * under it, so nothing shows through. Its height is `BOTTOM_BAR_HEIGHT` plus that inset, and the cart bar and
 * the pages above it use the same number.
 */
export function BottomBar({ tabs, activeKey, onSelect }: BottomBarProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      role="tablist"
      style={[
        styles.bar,
        { height: BOTTOM_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            role="tab"
            aria-selected={active}
            aria-label={tab.label}
            onPress={() => {
              onSelect(tab.key);
            }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.pill, active && styles.pillOn]}>
              <Icon name={tab.icon} color={active ? colors.action : colors.inkMuted} size={24} />
            </View>
            <Text variant="caption" color={active ? 'action' : 'inkMuted'} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
