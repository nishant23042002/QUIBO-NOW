import { useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useHomeScroll } from './HomeScroll';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';

export interface ProductRailProps {
  title: string;
  /** The text of the button under the row, for example "See all". Leave it and `onSeeAll` out for a row with nowhere to go. */
  seeAllLabel?: string;
  onSeeAll?: () => void;
  /** The cards. They sit in one row that swipes sideways. */
  children: ReactNode;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    rail: { gap: space[3] },
    // The title row has the page's own colour, so the cards slide out of sight behind it as it sticks.
    head: {
      zIndex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      backgroundColor: c.bg,
    },
    title: { flexShrink: 1, minWidth: 0 },
    // A dotted line carries on from the title to the edge of the page.
    dots: { flex: 1, minWidth: space[6], height: 2 },
    // Under the row, the width of the page: the way into the whole category.
    more: {
      marginHorizontal: space[4],
      minHeight: TAP_MIN,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      borderWidth: 1.5,
      borderRadius: radius.lg,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    pressed: { backgroundColor: c.muted },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * A titled row of items with a dotted line from its title to the page's edge and a "See all" button under the row. On the home page the title sticks just under the tabs while
 * its row scrolls past, then is pushed out by the next row's title. The sticking is a transform driven by the
 * page's scroll position, so it runs on the phone's animation thread and never lags the finger.
 */
export function ProductRail({ title, seeAllLabel, onSeeAll, children }: ProductRailProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const home = useHomeScroll();
  // Where the rail is within the page content, and how tall its title row is. Measured once.
  const [box, setBox] = useState({ y: 0, height: 0 });
  const [headHeight, setHeadHeight] = useState(0);

  const travel = box.height - headHeight;
  const sticky =
    home !== null && headHeight > 0 && travel > 0
      ? (() => {
          const start = home.childrenTop + box.y - home.pin;
          return home.scroll.interpolate({
            inputRange: [start, start + travel],
            outputRange: [0, travel],
            extrapolate: 'clamp',
          });
        })()
      : null;

  return (
    <View
      style={styles.rail}
      onLayout={(event) => {
        const { y, height } = event.nativeEvent.layout;
        setBox((current) =>
          current.y === y && current.height === height ? current : { y, height },
        );
      }}
    >
      <Animated.View
        style={[styles.head, sticky !== null ? { transform: [{ translateY: sticky }] } : null]}
        onLayout={(event) => {
          setHeadHeight(Math.round(event.nativeEvent.layout.height));
        }}
      >
        <View style={styles.title}>
          <Text variant="subheading" numberOfLines={2}>
            {title}
          </Text>
        </View>
        <View style={styles.dots} aria-hidden>
          <Svg width="100%" height={2}>
            <Line
              x1="1"
              y1="1"
              x2="100%"
              y2="1"
              stroke={colors.ctl}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="0.1 6"
            />
          </Svg>
        </View>
      </Animated.View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>{children}</View>
      </ScrollView>
      {seeAllLabel !== undefined && onSeeAll !== undefined ? (
        <Pressable
          role="button"
          aria-label={`${seeAllLabel}: ${title}`}
          onPress={onSeeAll}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <Text variant="strong">{seeAllLabel}</Text>
          <Icon name="chevronRight" color={colors.ink} size={16} />
        </Pressable>
      ) : null}
    </View>
  );
}
