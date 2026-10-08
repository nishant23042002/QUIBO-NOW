import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { CategoryTabs, type CategoryTab } from './CategoryTabs';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import type { ShopInfoCardProps } from './ShopInfoCard';
import { ShopsChip } from './ShopsChip';
import { SearchBar, type SearchHint } from './SearchBar';
import { ShopsPanel } from './ShopsPanel';
import { Text } from './Text';
import { TAP_MIN, space } from './tokens';
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
  profileLabel: string;
  onSearchPress: () => void;
  onAddressPress: () => void;
  onProfilePress: () => void;
}

const makeStyles = (_c: ThemeColors) =>
  StyleSheet.create({
    // The tint is painted behind the status bar too, so the top of the screen is part of the header.
    // The colour itself is animated (see below). The tabs end the block, so nothing is padded under them.
    bar: { paddingBottom: 0 },
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
    // The bar's right padding leaves room for the profile button's empty edge; the chip keeps the full 16 dp gutter.
    chip: { marginRight: BUTTON_INSET, alignItems: 'flex-start' },
    search: { marginTop: space[3] },
    tabs: { marginTop: space[2] },
    pressed: { opacity: 0.7 },
  });

/**
 * The top block of Home: the delivery window, the address, the shops chip (which opens a row of shop cards
 * under it), the search bar, the category tabs, and the profile button. The block takes the chosen category's tint.
 * It fills the status bar area with its own colour, and the status bar text follows the tint:
 * dark on the light theme's soft tint, light on the dark theme's deep one.
 *
 * Spacing: a 16 dp gutter on both sides (the profile circle, not its touch target, sits on the right
 * gutter), 12 dp below the status bar, the address under the heading, the shops chip 4 dp under the address, the search bar 12 dp under the chip (or under the shops row when it is open), then the category tabs, which end the block.
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
  profileLabel,
  onSearchPress,
  onAddressPress,
  onProfilePress,
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

  return (
    <Animated.View
      role="banner"
      style={[styles.bar, { backgroundColor: background, paddingTop: insets.top + space[3] }]}
    >
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
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
            <IconButton icon="user" label={profileLabel} onPress={onProfilePress} ground="header" />
          </View>
        </View>
        {/* Under both columns, so it can use the full width instead of wrapping beside the profile button. */}
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
      {/* Slides open under the chip and pushes the page down; the cards swipe sideways. */}
      <ShopsPanel open={shopsOpen} title={shopsTitle} shops={shops} />
      {/* Last in the block, so it stays next to what comes after it (the category tabs) whether the shops are open or not. */}
      <View
        style={[
          styles.search,
          {
            paddingLeft: insets.left + space[4],
            paddingRight: insets.right + space[4],
          },
        ]}
      >
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
  );
}
