import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useChromeProgress } from './chrome';
import { PopOnChange } from './ChangeCue';
import { Icon, type IconName } from './Icon';
import { NAV_STYLE, indicatorLeft, shownTab, type PendingTab } from './logic/navBar';
import { Text } from './Text';
import { BOTTOM_BAR_HEIGHT, radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

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
  /**
   * A tile at the far right edge, outside the tabs: a spot for something of the app's own (for now the logo). It is not a tab and
   * not pressed. It is set in from the bar's top and bottom and sits clear of the strip behind the phone's buttons.
   */
  trailing?: ReactNode;
}

/** How wide the tile at the right edge is. The tabs share what is left. */
export const TRAILING_WIDTH = 68;
/** How far the tile at the right edge is set in from the bar's top and bottom. */
const TRAILING_INSET = space[2];

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
/** The gliding line along the bar's top edge: how wide and tall it is, and how long it takes to glide to the next tab. */
const LINE_WIDTH = 28;
const LINE_HEIGHT = 3;
const GLIDE_MS = 260;
const GLIDE_EASE = Easing.bezier(0.4, 0, 0.2, 1);
/** A pressed tab stays lit this long if the screen never changes (a press that went nowhere). */
const PENDING_MS = 700;

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
    tabs: { flex: 1, flexDirection: 'row' },
    // A short line on the bar's top edge that glides to the chosen tab.
    line: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: LINE_WIDTH,
      height: LINE_HEIGHT,
      borderBottomLeftRadius: radius.sm,
      borderBottomRightRadius: radius.sm,
      backgroundColor: c.action,
    },
    // The tile at the right edge: the app's dark colour, set in from the bar's top and bottom, flush with the screen's right edge
    // and rounded on both left corners.
    trailing: {
      width: TRAILING_WIDTH,
      marginTop: TRAILING_INSET,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopLeftRadius: radius.lg,
      borderBottomLeftRadius: radius.lg,
      backgroundColor: c.chrome,
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
    pillOn: { backgroundColor: c.lilac },
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
 * A tab's icon. In the lively look the chosen tab's icon turns solid and gives a short pop the moment it is chosen (not when the
 * screen first draws, and not with "reduce motion" on).
 */
function TabIcon({
  name,
  active,
  lively,
  color,
  cutColor,
}: {
  name: IconName;
  active: boolean;
  lively: boolean;
  color: string;
  cutColor: string;
}) {
  const reduceMotion = useReduceMotion();
  const [pop] = useState(() => new Animated.Value(1));
  const wasActive = useRef(active);

  useEffect(() => {
    const before = wasActive.current;
    wasActive.current = active;
    if (!lively || !active || before || reduceMotion) return undefined;
    pop.setValue(0.7);
    const settle = Animated.spring(pop, {
      toValue: 1,
      friction: 4,
      tension: 210,
      useNativeDriver: true,
    });
    settle.start();
    return () => {
      settle.stop();
    };
  }, [lively, active, reduceMotion, pop]);

  const solid = lively && active;
  return (
    <Animated.View style={{ transform: [{ scale: pop }] }}>
      <Icon name={name} color={color} size={24} light={!solid} filled={solid} cutColor={cutColor} />
    </Animated.View>
  );
}

/**
 * The bottom navigation bar: one tab for each main screen, the chosen one with a soft pistachio pill behind its
 * icon and its name in full colour. The icons are drawn with the thin line, and only the chosen tab's name is
 * set heavier than regular. A tab can carry a count (the cart's items), which pops when it changes. It is solid, and tall enough to hold the phone's own navigation buttons
 * under it, so nothing shows through. Its height is `BOTTOM_BAR_HEIGHT` plus that inset, and the cart bar and
 * the pages above it use the same number.
 */
export function BottomBar({ tabs, activeKey, onSelect, trailing }: BottomBarProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const hide = useChromeProgress();
  const height = BOTTOM_BAR_HEIGHT + insets.bottom;
  const lively = NAV_STYLE === 'lively';

  // A press lights its tab at once, before the screen change reaches the bar, so a tap is seen however busy the phone is.
  const [pending, setPending] = useState<PendingTab | null>(null);
  const shown = shownTab(activeKey, pending);
  useEffect(() => {
    if (pending === null) return undefined;
    const timer = setTimeout(() => {
      setPending(null);
    }, PENDING_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [pending]);

  // The gliding line: where the chosen tab is, and how wide a tab is once the row has been measured.
  const index = tabs.findIndex((tab) => tab.key === shown);
  const [rowWidth, setRowWidth] = useState(0);
  const tabWidth = tabs.length > 0 ? rowWidth / tabs.length : 0;
  const [slide] = useState(() => new Animated.Value(Math.max(index, 0)));
  const [lineOn] = useState(() => new Animated.Value(index >= 0 ? 1 : 0));
  useEffect(() => {
    if (!lively) return undefined;
    const target = Math.max(index, 0);
    const visible = index >= 0 ? 1 : 0;
    if (reduceMotion) {
      slide.setValue(target);
      lineOn.setValue(visible);
      return undefined;
    }
    const glide = Animated.parallel([
      Animated.timing(slide, {
        toValue: target,
        duration: GLIDE_MS,
        easing: GLIDE_EASE,
        useNativeDriver: true,
      }),
      Animated.timing(lineOn, { toValue: visible, duration: 160, useNativeDriver: true }),
    ]);
    glide.start();
    return () => {
      glide.stop();
    };
  }, [lively, index, reduceMotion, slide, lineOn]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height,
          // Sliding straight down out of the way as the page is read, with no fade, so it never seems to jump; with "reduce motion"
          // on it only fades.
          opacity: reduceMotion ? hide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) : 1,
          transform: [
            {
              translateY: reduceMotion
                ? 0
                : hide.interpolate({ inputRange: [0, 1], outputRange: [0, height] }),
            },
          ],
        },
      ]}
    >
      <View
        role="tablist"
        style={[styles.tabs, { paddingBottom: insets.bottom }]}
        onLayout={(event) => {
          setRowWidth(event.nativeEvent.layout.width);
        }}
      >
        {lively && tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            aria-hidden
            style={[
              styles.line,
              {
                opacity: lineOn,
                transform: [
                  {
                    translateX: Animated.add(
                      Animated.multiply(slide, tabWidth),
                      indicatorLeft(0, tabWidth, LINE_WIDTH),
                    ),
                  },
                ],
              },
            ]}
          />
        ) : null}
        {tabs.map((tab) => {
          const active = tab.key === shown;
          return (
            <Pressable
              key={tab.key}
              role="tab"
              aria-selected={active}
              aria-label={tab.accessibilityLabel ?? tab.label}
              onPress={() => {
                if (tab.key === shown) {
                  onSelect(tab.key);
                  return;
                }
                setPending({ key: tab.key, from: activeKey });
                // The lit tab is drawn first, then the screen changes a frame later.
                requestAnimationFrame(() => {
                  onSelect(tab.key);
                });
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <View style={[styles.pill, active && styles.pillOn]}>
                <TabIcon
                  name={tab.icon}
                  active={active}
                  lively={lively}
                  color={active ? colors.action : colors.inkMuted}
                  cutColor={colors.accentSubtle}
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
      {trailing !== undefined ? (
        <View
          style={[styles.trailing, { marginBottom: insets.bottom + TRAILING_INSET }]}
          aria-hidden
        >
          {trailing}
        </View>
      ) : null}
    </Animated.View>
  );
}
