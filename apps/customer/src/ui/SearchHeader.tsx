import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, type ThemeColors } from '@/theme';
import { ScreenStatusBar } from './ScreenStatusBar';
import { SearchBar, type SearchBarProps } from './SearchBar';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface SearchHeaderProps {
  /** The screen's name, large above the search field until the page is scrolled. */
  title: string;
  /** The page's vertical scroll position, driven by `Animated.event` with the native driver. */
  scrollY: Animated.Value;
  /** The field: its name for a screen reader, the words that type themselves in, and what pressing it does. */
  search: Pick<SearchBarProps, 'placeholder' | 'hint' | 'onPress'>;
}

/** The room the title takes above the field, and what the header gives back as the page scrolls. */
const TITLE_HEIGHT = 48;
/** The search field's own height (see `SearchBar`). */
const FIELD_HEIGHT = 52;
const PAD_BELOW = space[3];

/**
 * How tall the header is when the page has not scrolled: the status bar, the title, the field and a little room under it.
 * A page puts this much space above its first row; the header lays over the top of the page and does not push anything.
 */
export function useSearchHeaderHeight(): number {
  const insets = useSafeAreaInsets();
  return insets.top + space[1] + TITLE_HEIGHT + FIELD_HEIGHT + PAD_BELOW;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // Lies over the top of the page. Only what is drawn takes touches, so the empty strip left under it as it shrinks does not.
    root: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
    // The deep aubergine block with the rounded lower edge, as on every other screen's header.
    block: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: c.chrome,
      borderBottomLeftRadius: radius.lg,
      borderBottomRightRadius: radius.lg,
    },
    // Keeps the colour behind the phone's status bar once the block has slid up, so nothing shows through there.
    strip: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: c.chrome },
    title: { justifyContent: 'center', height: TITLE_HEIGHT },
    field: { position: 'absolute' },
  });

/**
 * The header of a page that is searched first: the screen's name over a search field, both on the aubergine block, drawn over the
 * top of the page. As the page scrolls the name slides up and fades and the block gives back its height, so the field is left
 * pinned at the top with the whole page's room below it. It runs on the phone's animation thread (transforms and opacity only),
 * so it keeps pace with the finger.
 */
export function SearchHeader({ title, scrollY, search }: SearchHeaderProps) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const top = insets.top + space[1];
  const total = useSearchHeaderHeight();
  const side = space[4];

  // The block and the field rise together by exactly the title's height, so the field's gap to the top never changes.
  const lift = scrollY.interpolate({
    inputRange: [0, TITLE_HEIGHT],
    outputRange: [0, -TITLE_HEIGHT],
    extrapolate: 'clamp',
  });
  const fade = scrollY.interpolate({
    inputRange: [0, TITLE_HEIGHT * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View role="banner" pointerEvents="box-none" style={[styles.root, { height: total }]}>
      <ScreenStatusBar style="light" />
      <Animated.View style={[styles.block, { height: total, transform: [{ translateY: lift }] }]}>
        <View style={[styles.title, { marginTop: top, paddingLeft: insets.left + side }]}>
          <Animated.View style={{ opacity: fade }}>
            <Text variant="heading" color="onChrome" numberOfLines={1} role="heading">
              {title}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
      <View pointerEvents="none" style={[styles.strip, { height: top }]} />
      <Animated.View
        style={[
          styles.field,
          {
            top: top + TITLE_HEIGHT,
            left: insets.left + side,
            right: insets.right + side,
            transform: [{ translateY: lift }],
          },
        ]}
      >
        <SearchBar {...search} />
      </Animated.View>
    </View>
  );
}
