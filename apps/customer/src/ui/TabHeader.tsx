import type { ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { HeaderGlow } from './HeaderGlow';
import { HeaderIdentity, type HeaderIdentityProps } from './HeaderIdentity';
import { ScreenStatusBar } from './ScreenStatusBar';
import { SearchBar, type SearchHint } from './SearchBar';
import { radius, space } from './tokens';

/** Layers that meet overlap by this much, so a fraction of a pixel never shows a hairline of the page between them. */
const SEAM = 1;
/** The tint carries on this far above the page, so pulling it down past the top shows the tint and not the page. */
const BLEED = 600;
/** The rounded cap under the search bar when the page has not scrolled. */
const CAP = space[4];

export interface TabHeaderProps extends HeaderIdentityProps {
  /** The search bar's name for a screen reader. */
  searchLabel: string;
  /** The search bar's hint: a fixed part ("Search") and example words that type themselves in. */
  searchHint: SearchHint;
  onSearchPress: () => void;
  /**
   * A row that sits under the search bar and stays with it, in the place Home keeps its category tabs: for Orders, the filter
   * chips. Leave out when a tab has nothing to put there.
   */
  rail?: ReactNode;
  /** Extra room under the page's last row, for something floating over it such as the cart bar and the bottom bar. */
  bottomSpace?: number;
  /** Told how far the page has scrolled, on every scroll event: the bottom bar hides and shows from it. */
  onScrollY?: (offset: number) => void;
  /** The page under the header. It scrolls, and the header folds as it does. */
  children: ReactNode;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    frame: { flex: 1, backgroundColor: c.bg },
    overlay: { position: 'absolute', left: 0, right: 0 },
    top: { paddingTop: space[3], paddingBottom: space[1] },
    // One dp more than it looks, because the lower part overlaps the upper by 1 dp (see SEAM).
    search: { paddingTop: space[2] + SEAM, paddingBottom: space[2] },
    rail: { paddingBottom: space[2] },
    cap: {
      height: CAP,
      borderBottomLeftRadius: radius.lg,
      borderBottomRightRadius: radius.lg,
    },
    bleed: { position: 'absolute', top: -BLEED, left: 0, right: 0, height: BLEED },
  });

/**
 * The header Home wears, for the tabs that are not Home: the same delivery promise, address and profile button on the same
 * lilac tint, with the search bar under them. It behaves exactly as Home's does. As the page scrolls the upper part slides up and
 * out, one for one with the finger, and the search bar (with the rail under it, if the tab has one) rises with it and stops under
 * the status bar. It only moves, on the phone's animation thread, and nothing is laid out while it does.
 *
 * What Home adds on top of this (the shops row, the category tabs, the offers) stays on Home: on the other tabs the page itself is
 * the categories or the orders, so repeating them would only push the page down.
 */
export function TabHeader({
  deliveryLine,
  address,
  addressCaption,
  profileLabel,
  onAddressPress,
  onProfilePress,
  searchLabel,
  searchHint,
  onSearchPress,
  rail,
  bottomSpace = 0,
  onScrollY,
  children,
}: TabHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const tint = colors.headerDeep;
  const [scrollY] = useState(() => new Animated.Value(0));
  // How tall the two pieces are, measured, so the page can start below them and the upper part knows how far to travel.
  const [topHeight, setTopHeight] = useState(0);
  const [lowerHeight, setLowerHeight] = useState(0);

  // The scroll position never goes below 0, so pulling the page down past the top cannot drag the search bar away.
  const scroll = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp',
  });

  // The upper part travels right off the top of the screen, fading as it goes: slowly at first, gone by the time it leaves.
  const exit = Math.max(topHeight + insets.top, 1);
  const slideTop = scroll.interpolate({
    inputRange: [0, exit],
    outputRange: [0, -exit],
    extrapolate: 'clamp',
  });
  const fadeOut = scroll.interpolate({
    inputRange: [0, exit * 0.25, exit * 0.85],
    outputRange: [1, 0.85, 0],
    extrapolate: 'clamp',
  });
  // The search bar follows it up exactly as far as the status bar, then stays.
  const stick = Math.max(topHeight, 1);
  const slideLower = scroll.interpolate({
    inputRange: [0, stick],
    outputRange: [0, -stick],
    extrapolate: 'clamp',
  });

  const lowerTop = insets.top + topHeight - SEAM;
  const ready = topHeight > 0 && lowerHeight > 0;
  const gutter = {
    paddingLeft: insets.left + space[4],
    paddingRight: insets.right + space[4],
  };

  return (
    <View style={styles.frame}>
      {/* The header is deep in both themes, so the status bar's text is light. */}
      <ScreenStatusBar style="light" />
      <Animated.ScrollView
        // The page starts below the header, whose height is measured a moment after the first draw. Until then it would sit at
        // the top and then drop; held back, it appears where it belongs.
        style={{ opacity: ready ? 1 : 0 }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            onScrollY?.(event.nativeEvent.contentOffset.y);
          },
        })}
        contentContainerStyle={{
          paddingTop: lowerTop + lowerHeight - SEAM,
          // Room under the last row for the phone's own buttons, the bars that float over the page, and a little more.
          paddingBottom: insets.bottom + space[4] + bottomSpace,
        }}
      >
        <View style={[styles.cap, { backgroundColor: tint }]}>
          <View pointerEvents="none" style={[styles.bleed, { backgroundColor: tint }]} />
        </View>
        {children}
      </Animated.ScrollView>

      {/* The tint behind the status bar. It stays put, and the part that slides away passes over it. */}
      <View
        pointerEvents="none"
        style={[styles.overlay, { top: 0, height: insets.top + SEAM, backgroundColor: tint }]}
      />

      {/* The upper part: it moves with the page and leaves through the very top of the screen. */}
      <Animated.View
        role="banner"
        pointerEvents="box-none"
        style={[styles.overlay, { top: insets.top, transform: [{ translateY: slideTop }] }]}
      >
        <View style={{ backgroundColor: tint }}>
          <HeaderGlow lift={insets.top} />
          <Animated.View
            style={[styles.top, { opacity: fadeOut }]}
            onLayout={(event) => {
              setTopHeight(Math.round(event.nativeEvent.layout.height));
            }}
          >
            <HeaderIdentity
              deliveryLine={deliveryLine}
              address={address}
              addressCaption={addressCaption}
              profileLabel={profileLabel}
              onAddressPress={onAddressPress}
              onProfilePress={onProfilePress}
            />
          </Animated.View>
        </View>
      </Animated.View>

      {/* The search bar (and the rail): they rise with the page until they meet the status bar, then stay. */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            top: lowerTop,
            transform: [{ translateY: slideLower }],
            // Placed below the upper part, whose height is measured a moment after the first draw.
            opacity: topHeight > 0 ? 1 : 0,
          },
        ]}
      >
        <View
          style={{ backgroundColor: tint }}
          onLayout={(event) => {
            setLowerHeight(Math.round(event.nativeEvent.layout.height));
          }}
        >
          <View style={[styles.search, gutter]}>
            <SearchBar placeholder={searchLabel} hint={searchHint} onPress={onSearchPress} />
          </View>
          {rail !== undefined ? <View style={[styles.rail, gutter]}>{rail}</View> : null}
        </View>
      </Animated.View>
    </View>
  );
}
