import { formatRupees, type Money } from '@quibo/contracts';
import { Animated, Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  HEADER_HEIGHT,
  Icon,
  IconButton,
  ScreenStatusBar,
  Text,
  radius,
  space,
  type TextColor,
} from '@/ui';
import type { HeaderLook } from './productHeaderLook';

export interface ProductHeaderProps {
  name: string;
  emoji: string;
  /** The product's category tint: the colour of the Home header for this category. */
  tint: string;
  price: Money;
  mrp?: Money;
  /** The delivery window, for example "Today 4–6 PM". Never minutes. */
  deliveryLabel: string;
  /** The whole delivery address on one line; it is cut with "…" when it does not fit. */
  addressLabel: string;
  backLabel: string;
  searchLabel: string;
  shareLabel: string;
  /** Which colour the header wears: the Home header's tint, or the deep aubergine. */
  look: HeaderLook;
  onBack: () => void;
  onSearch: () => void;
  onShare: () => void;
  /** Tapping the delivery line. For now it switches the header's look, so the two can be compared on a phone. */
  onDeliveryPress: () => void;
  /** The page's scroll position, from the native scroll event. */
  scrollY: Animated.Value;
  /** How far down the page the big picture ends. Past it, the header shows the product instead of its plain name. */
  revealAt: number;
}

const CHIP = 50;
/** How far the page scrolls while the plain name turns into the product card. */
const FADE = 56;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // The whole header is one block of colour with a rounded lower edge, over the soft page.
    bar: {
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
    },
    where: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      minHeight: 36,
    },
    when: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    dot: { width: 3, height: 3, borderRadius: 2 },
    address: { flex: 1, minWidth: 0 },
    row: { height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center' },
    back: { marginLeft: -space[2] },
    end: { marginRight: -space[2] },
    slot: { flex: 1, height: CHIP, justifyContent: 'center' },
    title: { position: 'absolute', left: space[2], right: 0 },
    chip: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: CHIP,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
    },
    thumb: {
      width: CHIP - space[2],
      height: CHIP - space[2],
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
    },
    text: { flex: 1, minWidth: 0 },
    price: { flexDirection: 'row', alignItems: 'baseline', gap: space[2], marginTop: -space[1] },
    pressed: { opacity: 0.7 },
  });

/**
 * The product page's header, one block of colour with a rounded lower edge. On top, where and when the order goes:
 * the delivery window and the full address. Under it, a back button, the product, and search and share buttons.
 * At the top of the page the product is just its name; once the big picture has scrolled away, the name gives way
 * to a small card with the product's picture, name and price, so the shopper always sees what they are looking
 * at. The change is a fade and a small slide driven by the page's scroll, which the phone animates on its own thread.
 *
 * It wears one of two colours while they are being compared (see `productHeaderLook.ts`): the soft tint of the
 * Home header, with the Home header's text and round buttons, or the deep aubergine of the app's dark bars.
 */
export function ProductHeader({
  name,
  emoji,
  tint,
  price,
  mrp,
  deliveryLabel,
  addressLabel,
  backLabel,
  searchLabel,
  shareLabel,
  look,
  onBack,
  onSearch,
  onShare,
  onDeliveryPress,
  scrollY,
  revealAt,
}: ProductHeaderProps) {
  const styles = useStyles(makeStyles);
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const purple = look === 'purple';
  const background = purple ? colors.chrome : tint;
  const text: TextColor = purple ? 'onChrome' : 'onHeader';
  const muted: TextColor = purple ? 'onChromeMuted' : 'onHeaderMuted';
  const priceColor: TextColor = purple ? 'accent' : 'onHeader';
  const iconColor = colors[text];
  const mutedColor = colors[muted];
  const range = [revealAt, revealAt + FADE];
  const chipOpacity = scrollY.interpolate({
    inputRange: range,
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const chipLift = scrollY.interpolate({
    inputRange: range,
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: range,
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      role="banner"
      style={[
        styles.bar,
        {
          backgroundColor: background,
          paddingTop: insets.top + space[1],
          paddingLeft: insets.left + space[4],
          paddingRight: insets.right + space[4],
        },
      ]}
    >
      {/* The tint is pale on the light theme and deep on the dark one, like the Home header; the aubergine is always deep. */}
      <ScreenStatusBar style={purple || scheme === 'dark' ? 'light' : 'dark'} />
      <Pressable
        role="button"
        aria-label={`${deliveryLabel}. ${addressLabel}`}
        onPress={onDeliveryPress}
        style={({ pressed }) => [styles.where, pressed && styles.pressed]}
      >
        <View style={styles.when}>
          <Icon name="clock" color={iconColor} size={16} />
          <Text variant="strong" color={text} numberOfLines={1}>
            {deliveryLabel}
          </Text>
        </View>
        <View style={[styles.dot, { backgroundColor: mutedColor }]} aria-hidden />
        <View style={styles.address}>
          <Text variant="strong" color={muted} numberOfLines={1}>
            {addressLabel}
          </Text>
        </View>
        <Icon name="chevron" color={mutedColor} size={16} />
      </Pressable>
      <View style={styles.row}>
        <View style={styles.back}>
          <IconButton
            icon="back"
            label={backLabel}
            onPress={onBack}
            ground={purple ? 'chrome' : 'header'}
          />
        </View>
        <View style={styles.slot}>
          <Animated.View style={[styles.title, { opacity: titleOpacity }]}>
            <Text variant="label" color={text} numberOfLines={1} role="heading">
              {name}
            </Text>
          </Animated.View>
          <Animated.View
            style={[styles.chip, { opacity: chipOpacity, transform: [{ translateY: chipLift }] }]}
            aria-hidden
          >
            <View style={[styles.thumb, { backgroundColor: purple ? tint : colors.surface }]}>
              <NativeText allowFontScaling={false} style={{ fontSize: 22, lineHeight: 28 }}>
                {emoji}
              </NativeText>
            </View>
            <View style={styles.text}>
              <Text variant="strong" color={text} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.price}>
                <Text variant="caption" color={priceColor}>
                  {formatRupees(price)}
                </Text>
                {mrp !== undefined && mrp > price ? (
                  <Text variant="caption" color={muted} strike>
                    {formatRupees(mrp)}
                  </Text>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </View>
        <IconButton
          icon="search"
          label={searchLabel}
          onPress={onSearch}
          ground={purple ? 'chrome' : 'header'}
        />
        <View style={styles.end}>
          <IconButton
            icon="share"
            label={shareLabel}
            onPress={onShare}
            ground={purple ? 'chrome' : 'header'}
          />
        </View>
      </View>
    </View>
  );
}
