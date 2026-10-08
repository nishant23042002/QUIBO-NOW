import { useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useHomeScroll } from './HomeScroll';
import { Icon } from './Icon';
import { Text } from './Text';
import { space } from './tokens';

export interface ProductRailProps {
  title: string;
  /** The text of the link at the right, for example "See all". */
  seeAllLabel: string;
  onSeeAll: () => void;
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
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
      backgroundColor: c.bg,
    },
    title: { flex: 1, minWidth: 0 },
    more: { minHeight: space[10], flexDirection: 'row', alignItems: 'center', gap: space[1] },
    pressed: { opacity: 0.7 },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * A titled row of items with a "See all" link. On the home page the title sticks just under the tabs while
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
        <Pressable
          role="button"
          aria-label={`${seeAllLabel}: ${title}`}
          onPress={onSeeAll}
          hitSlop={6}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <Text variant="strong" color="accentInk">
            {seeAllLabel}
          </Text>
          <Icon name="chevronRight" color={colors.accentInk} size={14} />
        </Pressable>
      </Animated.View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>{children}</View>
      </ScrollView>
    </View>
  );
}
