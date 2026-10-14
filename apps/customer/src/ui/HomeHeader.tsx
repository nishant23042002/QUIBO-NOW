import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { CategoryTabs, type CategoryTab } from './CategoryTabs';
import { HeaderGradient } from './HeaderGradient';
import { HeaderIdentity } from './HeaderIdentity';
import { PageFade } from './PageFade';
import { SearchBar, type SearchHint } from './SearchBar';
import type { ShopInfoCardProps } from './ShopInfoCard';
import { ShopsChip } from './ShopsChip';
import { ScreenStatusBar } from './ScreenStatusBar';
import { ShopsPanel } from './ShopsPanel';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/**
 * Layers that meet are laid over each other by this much, so a rounding difference of a fraction of a pixel
 * can never leave a hairline of the page showing between them.
 */
const SEAM = 1;

/** What the page's top block (the mosaic) can ask of the header it sits in. */
export interface HeroControls {
  /** Opens the row of shops under the shops chip and brings the page back to its top. */
  openShops: () => void;
}

export interface HomeHeaderProps {
  /** The small line over the estimate, for example "Estimated delivery". */
  deliveryLabel: string;
  /** The estimate in big type, already worded: a range ("15–20 mins") or a window ("Today, 5–6 PM"). Never a guarantee. */
  deliveryValue: string;
  /** The language in use, short, and what a screen reader says for the chip that changes it. */
  languageCode: string;
  languageLabel: string;
  onLanguagePress: () => void;
  /** The "Schedule a slot" button inside the search bar, with its words. */
  scheduleLabel: string;
  onSchedulePress: () => void;
  /** Where the order is going, for example "Roha, Raigad, Maharashtra". */
  address: string;
  /** Names the address row for a screen reader, for example "Deliver to". */
  addressCaption: string;
  /** The shops the chip counts and its panel lists. The chip shows the first three open shops. */
  shops: readonly (ShopInfoCardProps & { id: string })[];
  /** The chip's sentence, already worded and pluralised, for example "3 local shops open now". */
  shopsLabel: string;
  /** The title inside the panel, for example "Local shops in Roha". */
  shopsTitle: string;
  /** A shop's card in the panel was tapped: open that shop. */
  onShopPress: (id: string) => void;
  /** The search bar's name for a screen reader, for example "Search for items and shops". */
  searchLabel: string;
  /** The search bar's hint: a fixed part ("Search") and example words that type themselves in. */
  searchHint: SearchHint;
  /** The category tabs. Each carries the colour the header turns into while it is chosen. */
  categories: readonly (CategoryTab & { tint: string })[];
  selectedCategory: string;
  /** Names the row of tabs for a screen reader, for example "Categories". */
  categoriesLabel: string;
  onCategoryChange: (key: string) => void;
  /**
   * The top block of the page, drawn on the header's own colour straight under the tabs, so the header and it are one surface. It
   * scrolls away with the page. Home puts its "Right now in Roha" mosaic here.
   */
  hero: (controls: HeroControls) => ReactNode;
  profileLabel: string;
  onSearchPress: () => void;
  onAddressPress: () => void;
  onProfilePress: () => void;
  /** Extra room under the page's last row, for something floating over it such as the cart bar. */
  bottomSpace?: number;
  /** Told how far the page has scrolled, on every scroll event: the bottom bar hides and shows from it. */
  onScrollY?: (offset: number) => void;
  /** The page under the header. It scrolls, and the header folds as it does. */
  children: ReactNode;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    frame: { flex: 1, backgroundColor: c.bg },
    // The two pieces that stay on screen, laid over the scrolling page.
    overlay: { position: 'absolute', left: 0, right: 0 },
    // The upper part: heading, address, profile button and the shops chip with its row.
    top: { paddingTop: space[3], paddingBottom: space[1] },
    chip: { alignItems: 'flex-start' },
    // The lower part, which stays at the top of the screen: the search bar and the tabs.
    // One dp more than it looks, because the lower part overlaps the upper by 1 dp (see SEAM).
    search: { paddingTop: space[2] + SEAM },
    tabs: { marginTop: space[2] },
    // The hero is on the page's own colour: the header's lilac has faded into it by the bottom of the tabs, so the header and the
    // first block are one surface with no edge. It scrolls away with the page.
    hero: { backgroundColor: c.bg, paddingTop: space[3], paddingBottom: space[8] },
    // The page slides up over the hero's lower edge with rounded top corners. It clips what is inside, so a wash that starts at the
    // top follows the curve instead of showing square corners over the hero.
    sheet: {
      marginTop: -space[5],
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      backgroundColor: c.bg,
      overflow: 'hidden',
    },
    pressed: { opacity: 0.7 },
  });

/**
 * Home's header and the page it sits over. As the page scrolls, the upper part (heading, address, profile
 * button and shops chip) slides up, one for one with the finger, all the way out through the top of the screen,
 * fading as it goes. The search bar and the category tabs rise with it and stop under the status bar, square
 * at the bottom, with the tabs' fine line as their lower edge.
 * The header's colour fades in one straight line from the search bar into the page's own colour, which it has become by the bottom
 * of the tabs. The hero (Home's mosaic) sits on the page's colour under it, so the two are one surface, and it scrolls away with
 * the page; the page then slides up over its lower edge with rounded top corners. Nothing here resizes while scrolling or while the shops row opens: the header only moves, on the phone's own animation
 * thread, so the movement stays smooth however busy the rest of the app is.
 *
 * Everything, including the status bar area, is the header's deep colour (aubergine in the light theme, plum in the dark one), so
 * the status bar text is always light.
 */
export function HomeHeader({
  deliveryLabel,
  deliveryValue,
  languageCode,
  languageLabel,
  onLanguagePress,
  scheduleLabel,
  onSchedulePress,
  address,
  addressCaption,
  shops,
  shopsLabel,
  shopsTitle,
  onShopPress,
  searchLabel,
  searchHint,
  categories,
  selectedCategory,
  categoriesLabel,
  onCategoryChange,
  hero,
  profileLabel,
  onSearchPress,
  onAddressPress,
  onProfilePress,
  bottomSpace = 0,
  onScrollY,
  children,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [shopsOpen, setShopsOpen] = useState(false);
  const reduceMotion = useReduceMotion();
  const selectedIndex = Math.max(
    0,
    categories.findIndex((category) => category.key === selectedCategory),
  );
  const [tintAt] = useState(() => new Animated.Value(selectedIndex));
  const scrollRef = useRef<ScrollView>(null);
  const shownCategory = useRef(selectedCategory);
  const [scrollY] = useState(() => new Animated.Value(0));
  // How tall the two pieces are, measured, so the page can start below them and the upper part knows how far to travel.
  const [topHeight, setTopHeight] = useState(0);
  const [lowerHeight, setLowerHeight] = useState(0);
  // The shops row: how tall it is (measured once), and how open it is (0 to 1, driven natively).
  const [panelHeight, setPanelHeight] = useState(0);
  const [panelAt] = useState(() => new Animated.Value(0));
  // The mosaic's "Meet your shops" strip opens the row and brings the page back to its top, where the row is.
  const [toTop, setToTop] = useState(0);
  const openShops = useCallback(() => {
    setShopsOpen(true);
    setToTop((count) => count + 1);
  }, []);
  useEffect(() => {
    if (toTop > 0) scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [toTop]);

  // Opening and closing the shops row is one number moving on the phone's animation thread. Nothing is
  // measured or laid out while it runs.
  useEffect(() => {
    if (reduceMotion) {
      panelAt.setValue(shopsOpen ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(panelAt, {
      toValue: shopsOpen ? 1 : 0,
      duration: shopsOpen ? 420 : 280,
      easing: shopsOpen ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [shopsOpen, reduceMotion, panelAt]);

  // Choosing another category shows that category from the top, not from wherever the last one was left scrolled to. The page
  // under it is replaced at once (by its skeleton), so the jump is not animated.
  useEffect(() => {
    if (shownCategory.current === selectedCategory) return;
    shownCategory.current = selectedCategory;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [selectedCategory]);

  // The whole block, status bar area included, fades to the chosen category's colour.
  useEffect(() => {
    if (reduceMotion) {
      tintAt.setValue(selectedIndex);
      return undefined;
    }
    const fade = Animated.timing(tintAt, {
      toValue: selectedIndex,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    fade.start();
    return () => {
      fade.stop();
    };
  }, [selectedIndex, reduceMotion, tintAt]);

  const background =
    categories.length > 1
      ? tintAt.interpolate({
          inputRange: categories.map((_, index) => index),
          outputRange: categories.map((category) => category.tint),
        })
      : (categories[0]?.tint ?? colors.headerBg);

  // The scroll position never goes below 0, so pulling the page down past the top (some phones let it
  // bounce) cannot drag the search bar and tabs away from the upper part.
  const scroll = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp',
  });

  // The upper part travels right off the top of the screen: its own height plus the status bar's, so it is
  // never cut at the status bar. It fades as it goes, slowly at first and gone by the time it leaves.
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
  // The search bar and the tabs follow it up exactly as far as the status bar, then stay. While the shops row
  // is open they sit lower by its height, and still stop at the status bar when scrolled.
  const stick = Math.max(topHeight, 1);
  const rowHeight = Math.max(panelHeight, 1);
  const push = panelAt.interpolate({ inputRange: [0, 1], outputRange: [0, rowHeight] });
  const slideLower = Animated.subtract(scroll, push).interpolate({
    inputRange: [-rowHeight, stick],
    outputRange: [rowHeight, -stick],
    extrapolate: 'clamp',
  });

  // Where the lower part (search bar and tabs) starts when the page is at the top.
  const lowerTop = insets.top + topHeight - SEAM;
  const riseWithPage = scroll.interpolate({ inputRange: [0, 1], outputRange: [0, -1] });

  const gutter = {
    paddingLeft: insets.left + space[4],
    paddingRight: insets.right + space[4],
  };

  return (
    <View style={styles.frame}>
      <ScreenStatusBar style="header" />
      <Animated.ScrollView
        ref={scrollRef}
        // The page starts below the header, whose height is measured a moment after the first draw. Until then it would sit
        // at the top and then drop; held back, it appears where it belongs.
        style={{ opacity: topHeight > 0 && lowerHeight > 0 ? 1 : 0 }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            onScrollY?.(event.nativeEvent.contentOffset.y);
          },
        })}
        // The page starts below the header as it is when fully open.
        contentContainerStyle={{
          paddingTop: lowerTop + lowerHeight - SEAM,
          // Room under the last row for the phone's own navigation buttons (or the gesture bar), plus a little more.
          paddingBottom: (shopsOpen ? panelHeight : 0) + insets.bottom + space[4] + bottomSpace,
        }}
      >
        <Animated.View style={{ transform: [{ translateY: push }] }}>
          <View style={styles.hero}>{hero({ openShops })}</View>
          <View style={styles.sheet}>{children}</View>
        </Animated.View>
      </Animated.ScrollView>

      {/* The shops row, under the chip. It scrolls away with the page, one for one, and passes under the status bar's tint and the search bar and tabs, so nothing of it shows once it has gone up. It is uncovered as the search bar slides down. */}
      <Animated.View
        pointerEvents={shopsOpen ? 'box-none' : 'none'}
        style={[
          styles.overlay,
          {
            top: insets.top + topHeight,
            transform: [{ translateY: riseWithPage }],
            // Held back until the upper part has been measured, so it never shows at the top of the screen and then drops.
            opacity: topHeight > 0 ? 1 : 0,
          },
        ]}
      >
        <ShopsPanel
          progress={panelAt}
          open={shopsOpen}
          background={background}
          height={panelHeight}
          onHeight={setPanelHeight}
          title={shopsTitle}
          shops={shops}
          onShopPress={onShopPress}
        />
      </Animated.View>

      {/* The tint behind the status bar. It stays put, and the part that slides away passes over it. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { top: 0, height: insets.top + SEAM, backgroundColor: background }]}
      >
        <HeaderGradient />
      </Animated.View>

      {/* The upper part: it moves with the page and leaves through the very top of the screen. */}
      <Animated.View
        role="banner"
        pointerEvents="box-none"
        style={[styles.overlay, { top: insets.top, transform: [{ translateY: slideTop }] }]}
      >
        <Animated.View style={{ backgroundColor: background }}>
          <HeaderGradient />
          <Animated.View
            style={[styles.top, { opacity: fadeOut }]}
            onLayout={(event) => {
              setTopHeight(Math.round(event.nativeEvent.layout.height));
            }}
          >
            <HeaderIdentity
              deliveryLabel={deliveryLabel}
              deliveryValue={deliveryValue}
              address={address}
              addressCaption={addressCaption}
              profileLabel={profileLabel}
              languageCode={languageCode}
              languageLabel={languageLabel}
              onLanguagePress={onLanguagePress}
              onAddressPress={onAddressPress}
              onProfilePress={onProfilePress}
            />
            {/* Under both columns, so it can use the full width instead of wrapping beside the profile button. */}
            <View style={gutter}>
              <View style={styles.chip}>
                <ShopsChip
                  shopNames={shops.filter((shop) => shop.open).map((shop) => shop.name)}
                  label={shopsLabel}
                  open={shopsOpen}
                  onPress={() => {
                    setShopsOpen((current) => !current);
                  }}
                />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* The search bar and the tabs: they rise with the page until they meet the status bar, then stay. */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            top: lowerTop,
            transform: [{ translateY: slideLower }],
            // The same: it is placed below the upper part, whose height is measured a moment after the first draw.
            opacity: topHeight > 0 ? 1 : 0,
          },
        ]}
      >
        <Animated.View
          style={{ backgroundColor: background }}
          onLayout={(event) => {
            setLowerHeight(Math.round(event.nativeEvent.layout.height));
          }}
        >
          <HeaderGradient />
          {/* The header's colour starts to fade at the search bar and is the page's own colour by the bottom of the tabs. */}
          <PageFade />
          <View style={[styles.search, gutter]}>
            <SearchBar
              placeholder={searchLabel}
              hint={searchHint}
              onPress={onSearchPress}
              slot={{ label: scheduleLabel, onPress: onSchedulePress }}
            />
          </View>
          <View style={styles.tabs}>
            <CategoryTabs
              tabs={categories}
              selectedKey={selectedCategory}
              onSelect={onCategoryChange}
              label={categoriesLabel}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
