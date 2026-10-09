import { Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { PopOnChange } from './ChangeCue';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { BOTTOM_BAR_HEIGHT, radius, space } from './tokens';

export interface BottomBarTab {
  key: string;
  /** Already translated. */
  label: string;
  icon: IconName;
  /** A count shown on the icon, such as the items in the cart. Nothing shows for 0 or when it is left out. */
  badge?: number;
  /** What a screen reader says for the tab, when it is more than the label (for example "Cart, 2 items"). */
  accessibilityLabel?: string;
}

export interface BottomBarProps {
  tabs: readonly BottomBarTab[];
  activeKey: string;
  onSelect: (key: string) => void;
}

const PILL_WIDTH = 56;
const PILL_HEIGHT = 30;
/** The badge is a circle this wide and tall, ring included; its digit is 14, the smallest size anywhere in the app. */
const BADGE_SIZE = 22;
const BADGE_RING = 2;
const BADGE_INNER = BADGE_SIZE - BADGE_RING * 2;
/** The bar is a fixed height, so its names grow with the phone's text size only this far. */
const LABEL_SCALE_MAX = 1.2;
/** The most a count shows before it reads "99+". */
const BADGE_MAX = 99;

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
    // The count sits on the icon's upper right corner, with a ring of the bar's colour so it never runs into the icon.
    badgeSlot: { position: 'absolute', top: -7, right: 3 },
    badge: {
      minWidth: BADGE_SIZE,
      height: BADGE_SIZE,
      paddingHorizontal: space[1],
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      borderWidth: BADGE_RING,
      borderColor: c.surface,
      backgroundColor: c.action,
    },
    // The digit's line is exactly as tall as the room inside the ring, and the phone's extra padding above the letters is off, so
    // the digit sits in the middle on Android as it does on the web.
    badgeText: {
      fontSize: 14,
      lineHeight: BADGE_INNER,
      fontWeight: '600',
      textAlign: 'center',
      textAlignVertical: 'center',
      includeFontPadding: false,
      color: c.onAction,
    },
    pressed: { opacity: 0.7 },
  });

/**
 * The bottom navigation bar: one tab for each main screen, the chosen one with a soft pistachio pill behind its
 * icon and its name in full colour. The icons are drawn with the thin line, and only the chosen tab's name is
 * set heavier than regular. A tab can carry a count (the cart's items), which pops when it changes. It is solid, and tall enough to hold the phone's own navigation buttons
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
            aria-label={tab.accessibilityLabel ?? tab.label}
            onPress={() => {
              onSelect(tab.key);
            }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.pill, active && styles.pillOn]}>
              <Icon
                name={tab.icon}
                color={active ? colors.action : colors.inkMuted}
                size={24}
                light
              />
              {tab.badge !== undefined && tab.badge > 0 ? (
                <View style={styles.badgeSlot} aria-hidden>
                  <PopOnChange value={tab.badge}>
                    <View style={styles.badge}>
                      <NativeText allowFontScaling={false} style={styles.badgeText}>
                        {tab.badge > BADGE_MAX ? `${BADGE_MAX}+` : String(tab.badge)}
                      </NativeText>
                    </View>
                  </PopOnChange>
                </View>
              ) : null}
            </View>
            <Text
              variant="caption"
              color={active ? 'action' : 'inkMuted'}
              numberOfLines={1}
              maxFontSizeMultiplier={LABEL_SCALE_MAX}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
