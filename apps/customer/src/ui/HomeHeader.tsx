import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { CategoryTabs, type CategoryTab } from './CategoryTabs';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { PromoCarousel, type PromoSlide } from './PromoCarousel';
import { SearchBar, type SearchHint } from './SearchBar';
import type { ShopInfoCardProps } from './ShopInfoCard';
import { ShopsChip } from './ShopsChip';
import { ShopsPanel } from './ShopsPanel';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** The profile button's round fill is 38 dp inside a 48 dp touch target, so 5 dp of the target is empty on each side. */
const BUTTON_INSET = (TAP_MIN - 38) / 2;
/** The heading's first line is 30 dp tall (24 dp text); lifting the button by this much centres it on that line. */
const BUTTON_LIFT = (TAP_MIN - 30) / 2;

export interface HomeHeaderProps {
  /** The delivery promise as a clock window, already worded, for example "Delivery today, 4–6 PM". Never minutes. */
  deliveryLine: string;
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
  /** The offers that slide under the tabs. */
  offers: readonly PromoSlide[];
  /** Names the row of offers for a screen reader, for example "Offers". */
  offersLabel: string;
  onOfferPress: (id: string) => void;
  profileLabel: string;
  onSearchPress: () => void;
  onAddressPress: () => void;
  onProfilePress: () => void;
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
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
    text: { flex: 1, minWidth: 0 },
    address: {
      minHeight: space[10],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    addressText: { flexShrink: 1 },
    button: { marginTop: -BUTTON_LIFT },
    chip: { alignItems: 'flex-start' },
    // The lower part, which stays at the top of the screen: the search bar and the tabs.
    search: { paddingTop: space[2] },
    tabs: { marginTop: space[2] },
    // The offers sit in the page, under the tabs, in the same colour, and scroll away with it.
    offers: {
      paddingTop: space[3],
      paddingBottom: space[4],
      borderBottomLeftRadius: radius.lg,
      borderBottomRightRadius: radius.lg,
    },
    pressed: { opacity: 0.7 },
  });

/**
 * Home's header and the page it sits over. As the page scrolls, the upper part (heading, address, profile
 * button and shops chip) slides up, one for one with the finger, all the way out through the top of the screen,
 * fading as it goes. The search bar and the category tabs rise with it and stop under the status bar, square
 * at the bottom, with the tabs' fine line as their lower edge.
 * The offers belong to the page: they sit under the tabs in the header's colour, with rounded corners, and
 * scroll away. Nothing here resizes while scrolling or while the shops row opens: the header only moves, on the phone's own animation
 * thread, so the movement stays smooth however busy the rest of the app is.
 *
 * Everything, including the status bar area, takes the chosen category's tint, and the status bar text
 * follows it: dark on the light theme's soft tint, light on the dark theme's deep one.
 */
export function HomeHeader({
  deliveryLine,
  address,
  addressCaption,
  shops,
  shopsLabel,
  shopsTitle,
  searchLabel,
  searchHint,
  categories,
  selectedCategory,
  categoriesLabel,
  onCategoryChange,
  offers,
  offersLabel,
  onOfferPress,
  profileLabel,
  onSearchPress,
  onAddressPress,
  onProfilePress,
  children,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, scheme } = useTheme();
  const styles = useStyles(makeStyles);
  const [shopsOpen, setShopsOpen] = useState(false);
  const reduceMotion = useReduceMotion();
  const selectedIndex = Math.max(
    0,
    categories.findIndex((category) => category.key === selectedCategory),
  );
  const [tintAt] = useState(() => new Animated.Value(selectedIndex));
  const [scrollY] = useState(() => new Animated.Value(0));
  // How tall the two pieces are, measured, so the page can start below them and the upper part knows how far to travel.
  const [topHeight, setTopHeight] = useState(0);
  const [lowerHeight, setLowerHeight] = useState(0);
  // The shops row: how tall it is (measured once), and how open it is (0 to 1, driven natively).
  const [panelHeight, setPanelHeight] = useState(0);
  const [panelAt] = useState(() => new Animated.Value(0));

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

  // The upper part travels right off the top of the screen: its own height plus the status bar's, so it is
  // never cut at the status bar. It fades as it goes, slowly at first and gone by the time it leaves.
  const exit = Math.max(topHeight + insets.top, 1);
  const slideTop = scrollY.interpolate({
    inputRange: [0, exit],
    outputRange: [0, -exit],
    extrapolate: 'clamp',
  });
  const fadeOut = scrollY.interpolate({
    inputRange: [0, exit * 0.25, exit * 0.85],
    outputRange: [1, 0.85, 0],
    extrapolate: 'clamp',
  });
  // The search bar and the tabs follow it up exactly as far as the status bar, then stay. While the shops row
  // is open they sit lower by its height, and still stop at the status bar when scrolled.
  const stick = Math.max(topHeight, 1);
  const rowHeight = Math.max(panelHeight, 1);
  const push = panelAt.interpolate({ inputRange: [0, 1], outputRange: [0, rowHeight] });
  const slideLower = Animated.subtract(scrollY, push).interpolate({
    inputRange: [-rowHeight, stick],
    outputRange: [rowHeight, -stick],
    extrapolate: 'clamp',
  });

  const gutter = {
    paddingLeft: insets.left + space[4],
    paddingRight: insets.right + space[4],
  };

  return (
    <View style={styles.frame}>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        // The page starts below the header as it is when fully open.
        contentContainerStyle={{
          paddingTop: insets.top + topHeight + lowerHeight,
          paddingBottom: shopsOpen ? panelHeight : 0,
        }}
      >
        <Animated.View style={{ transform: [{ translateY: push }] }}>
          <Animated.View style={[styles.offers, { backgroundColor: background }]}>
            <PromoCarousel slides={offers} label={offersLabel} onPress={onOfferPress} />
          </Animated.View>
          {children}
        </Animated.View>
      </Animated.ScrollView>

      {/* The tint behind the status bar. It stays put, and the part that slides away passes over it. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { top: 0, height: insets.top, backgroundColor: background }]}
      />

      {/* The upper part: it moves with the page and leaves through the very top of the screen. */}
      <Animated.View
        role="banner"
        pointerEvents="box-none"
        style={[styles.overlay, { top: insets.top, transform: [{ translateY: slideTop }] }]}
      >
        <Animated.View style={{ backgroundColor: background }}>
          <Animated.View
            style={[styles.top, { opacity: fadeOut }]}
            onLayout={(event) => {
              setTopHeight(Math.round(event.nativeEvent.layout.height));
            }}
          >
            <View
              style={{
                paddingLeft: insets.left + space[4],
                paddingRight: insets.right + space[4] - BUTTON_INSET,
              }}
            >
              <View style={styles.row}>
                <View style={styles.text}>
                  <Text variant="heading" color="onHeader" numberOfLines={2}>
                    {deliveryLine}
                  </Text>
                  <Pressable
                    role="button"
                    aria-label={`${addressCaption}: ${address}`}
                    onPress={onAddressPress}
                    hitSlop={6}
                    style={({ pressed }) => [styles.address, pressed && styles.pressed]}
                  >
                    <Icon name="pin" color={colors.onHeader} size={16} />
                    <View style={styles.addressText}>
                      <Text variant="strong" color="onHeader" numberOfLines={2}>
                        {address}
                      </Text>
                    </View>
                    <Icon name="chevron" color={colors.onHeader} size={16} />
                  </Pressable>
                </View>
                <View style={styles.button}>
                  <IconButton
                    icon="user"
                    label={profileLabel}
                    onPress={onProfilePress}
                    ground="header"
                  />
                </View>
              </View>
            </View>
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

      {/* The shops row, under the chip. It rides with the upper part, and is uncovered as the search bar slides down. */}
      <Animated.View
        pointerEvents={shopsOpen ? 'box-none' : 'none'}
        style={[
          styles.overlay,
          { top: insets.top + topHeight, transform: [{ translateY: slideTop }] },
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
        />
      </Animated.View>

      {/* The search bar and the tabs: they rise with the page until they meet the status bar, then stay. */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          { top: insets.top + topHeight, transform: [{ translateY: slideLower }] },
        ]}
      >
        <Animated.View
          style={{ backgroundColor: background }}
          onLayout={(event) => {
            setLowerHeight(Math.round(event.nativeEvent.layout.height));
          }}
        >
          <View style={[styles.search, gutter]}>
            <SearchBar placeholder={searchLabel} hint={searchHint} onPress={onSearchPress} />
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
