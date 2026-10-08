import { formatRupees, type Money } from '@quibo/contracts';
import { StatusBar } from 'expo-status-bar';
import { Animated, Text as NativeText, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, type ThemeColors } from '@/theme';
import { HEADER_HEIGHT, IconButton, Text, radius, space } from '@/ui';

export interface ProductHeaderProps {
  name: string;
  emoji: string;
  /** The colour behind the little picture: the product's category tint. */
  tint: string;
  price: Money;
  mrp?: Money;
  /** Name of the back button for a screen reader. */
  backLabel: string;
  onBack: () => void;
  /** The page's scroll position, from the native scroll event. */
  scrollY: Animated.Value;
  /** How far down the page the big picture ends. Past it, the header shows the product instead of its plain name. */
  revealAt: number;
}

const CHIP = 50;
/** How far the page scrolls while the plain name turns into the product chip. */
const FADE = 56;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bar: { backgroundColor: c.chrome },
    row: { height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center' },
    back: { marginLeft: -space[2] },
    slot: { flex: 1, height: CHIP, justifyContent: 'center' },
    title: { position: 'absolute', left: 0, right: 0 },
    chip: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: CHIP,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingLeft: space[1],
      paddingRight: space[3],
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
    thumb: {
      width: CHIP - space[2],
      height: CHIP - space[2],
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
    },
    text: { flex: 1, minWidth: 0 },
    price: { flexDirection: 'row', alignItems: 'baseline', gap: space[2], marginTop: -space[1] },
  });

/**
 * The product page's header. At the top of the page it is the usual dark bar with the product's name. Once the big
 * picture has scrolled away, the name gives way to a small card with the product's picture, name and price, so the
 * shopper always sees what they are looking at, and the price, however far down the page they are. The change is a
 * fade and a small slide driven by the page's scroll, which the phone animates on its own thread.
 */
export function ProductHeader({
  name,
  emoji,
  tint,
  price,
  mrp,
  backLabel,
  onBack,
  scrollY,
  revealAt,
}: ProductHeaderProps) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
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
          paddingTop: insets.top,
          paddingLeft: insets.left + space[4],
          paddingRight: insets.right + space[4],
        },
      ]}
    >
      <StatusBar style="light" />
      <View style={styles.row}>
        <View style={styles.back}>
          <IconButton icon="back" label={backLabel} onPress={onBack} />
        </View>
        <View style={styles.slot}>
          <Animated.View style={[styles.title, { opacity: titleOpacity }]}>
            <Text variant="label" color="onChrome" numberOfLines={1} role="heading">
              {name}
            </Text>
          </Animated.View>
          <Animated.View
            style={[styles.chip, { opacity: chipOpacity, transform: [{ translateY: chipLift }] }]}
            aria-hidden
          >
            <View style={[styles.thumb, { backgroundColor: tint }]}>
              <NativeText allowFontScaling={false} style={{ fontSize: 22, lineHeight: 28 }}>
                {emoji}
              </NativeText>
            </View>
            <View style={styles.text}>
              <Text variant="strong" numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.price}>
                <Text variant="caption" color="accentInk">
                  {formatRupees(price)}
                </Text>
                {mrp !== undefined && mrp > price ? (
                  <Text variant="caption" color="inkMuted" strike>
                    {formatRupees(mrp)}
                  </Text>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
