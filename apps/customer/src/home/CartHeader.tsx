import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { HEADER_HEIGHT, IconButton, ScreenStatusBar, Text, radius, space } from '@/ui';

export interface CartHeaderProps {
  title: string;
  /** Under the title, for example "3 items". Leave out when the cart is empty. */
  subtitle?: string;
  backLabel: string;
  onBack: () => void;
  /** Gives the header a share button at its end. Both are needed. */
  shareLabel?: string;
  onShare?: () => void;
}

/** An icon button's circle is 38 dp inside a 48 dp touch area, so the circle sits this far in from the area's edge. */
const CIRCLE_INSET = 5;

const makeStyles = (_c: ThemeColors) =>
  StyleSheet.create({
    // One block of the Home header's colour with a rounded lower edge, like the product page's header.
    bar: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
    // A fine line all the way round the lower edge, curves included, in the header's own text colour at a light
    // strength, so it shows on every tint and in both themes. Its top and sides sit one dp off the screen.
    edge: {
      position: 'absolute',
      top: -1,
      left: -1,
      right: -1,
      bottom: 0,
      borderWidth: 1,
      borderBottomLeftRadius: radius.lg,
      borderBottomRightRadius: radius.lg,
      opacity: 0.15,
    },
    row: { height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // Pulled out by the circle's inset, so the circle's outer edge lines up with the page's cards.
    back: { marginLeft: -CIRCLE_INSET },
    title: { flex: 1, minWidth: 0 },
    end: { marginRight: -CIRCLE_INSET },
  });

/** The cart page's header: the Home tint, a back button, "Cart" and how many items are in it. */
export function CartHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  shareLabel,
  onShare,
}: CartHeaderProps) {
  const styles = useStyles(makeStyles);
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      role="banner"
      style={[
        styles.bar,
        {
          backgroundColor: colors.headerBg,
          paddingTop: insets.top + space[1],
          paddingLeft: insets.left + space[3],
          paddingRight: insets.right + space[3],
        },
      ]}
    >
      {/* The tint is pale on the light theme and deep on the dark one, so the status bar text follows it. */}
      <ScreenStatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <View
        pointerEvents="none"
        style={[styles.edge, { borderColor: colors.onHeader }]}
        aria-hidden
      />
      <View style={styles.row}>
        <View style={styles.back}>
          <IconButton icon="back" label={backLabel} onPress={onBack} ground="header" />
        </View>
        <View style={styles.title}>
          <Text variant="label" color="onHeader" numberOfLines={1} role="heading">
            {title}
          </Text>
          {subtitle !== undefined ? (
            <Text variant="caption" color="onHeaderMuted" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {shareLabel !== undefined && onShare !== undefined ? (
          <View style={styles.end}>
            <IconButton icon="share" label={shareLabel} onPress={onShare} ground="header" />
          </View>
        ) : null}
      </View>
    </View>
  );
}
