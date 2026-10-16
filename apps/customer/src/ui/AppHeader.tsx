import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, type ThemeColors } from '@/theme';
import { HeaderLogo } from './brand/HeaderLogo';
import { HeaderGradient } from './HeaderGradient';
import { HeaderThumb, type HeaderThumbContent } from './HeaderThumb';
import { IconButton } from './IconButton';
import { ScreenStatusBar, useHeaderStatusBarStyle } from './ScreenStatusBar';
import { Text } from './Text';
import { HEADER_HEIGHT, space } from './tokens';

export interface AppHeaderProps {
  /** On the first screen: the QUIBO NOW logo, named for screen readers. Leave out on other screens. */
  logoLabel?: string;
  /** On other screens: the screen's title. */
  title?: string;
  /** Under the title, for example "3 items". Leave out when there is nothing worth saying. */
  subtitle?: string;
  /** Give both to show a back button. A screen that is one of the tabs has none. */
  onBack?: () => void;
  backLabel?: string;
  /** Gives the header a share button at its end. Both are needed. */
  shareLabel?: string;
  onShare?: () => void;
  /**
   * Which status bar goes with it. Screens in the tabs stay mounted after they are left, so theirs only exists while the screen is in
   * front ('screen', the usual). A screen outside the tabs, such as Settings, has no use for that and always sets it ('always').
   */
  statusBar?: 'screen' | 'always';
  /** A small round picture that slides in beside the title once the page is scrolled (`thumbShown`), and folds away at the top. */
  thumb?: HeaderThumbContent;
  thumbShown?: boolean;
}

/** An icon button's circle is 38 dp inside a 48 dp touch area, so the circle sits this far in from the area's edge. */
const CIRCLE_INSET = 5;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // One block of the header's colour with a square lower edge, on every screen but Home and the item page (which wears the colour
    // of its category).
    bar: { backgroundColor: c.headerBg },
    row: { minHeight: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // Pulled out by the circle's inset, so the circle's outer edge lines up with the page's cards.
    back: { marginLeft: -CIRCLE_INSET },
    // With no back button the title starts where the cards' text does.
    titleAlone: { marginLeft: space[1] },
    title: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
    words: { flex: 1, minWidth: 0 },
    end: { marginRight: -CIRCLE_INSET },
    spacer: { flex: 1 },
  });

/**
 * The header of every screen except Home and the item page: the header's colour (lilac in the light theme, plum in the dark one)
 * with a square lower edge, a pale round back button, the title, and optionally a line under it and a share button at the end. Its height is the same every time:
 * the status bar's height from the phone, plus a fixed 56 dp, which the line under the title fits inside. The colour is painted
 * behind the status bar, so the app fills the whole screen.
 */
export function AppHeader({
  logoLabel,
  title,
  subtitle,
  onBack,
  backLabel,
  shareLabel,
  onShare,
  statusBar = 'screen',
  thumb,
  thumbShown = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const back = onBack !== undefined && backLabel !== undefined;
  const barStyle = useHeaderStatusBarStyle();

  return (
    <View
      role="banner"
      style={[
        styles.bar,
        {
          paddingTop: insets.top + space[1],
          paddingLeft: insets.left + space[3],
          paddingRight: insets.right + space[3],
        },
      ]}
    >
      <HeaderGradient />
      {/* The status bar text reads on the header: dark on lilac, light on plum. */}
      {statusBar === 'always' ? <StatusBar style={barStyle} /> : <ScreenStatusBar style="header" />}
      <View style={styles.row}>
        {back ? (
          <View style={styles.back}>
            <IconButton icon="back" label={backLabel} onPress={onBack} ground="header" />
          </View>
        ) : null}
        {logoLabel !== undefined ? <HeaderLogo label={logoLabel} /> : null}
        {title !== undefined ? (
          <View style={[styles.title, !back && styles.titleAlone]}>
            <HeaderThumb shown={thumbShown} content={thumb} />
            <View style={styles.words}>
              <Text variant="label" color="onHeader" numberOfLines={2} role="heading">
                {title}
              </Text>
              {subtitle !== undefined ? (
                <Text variant="caption" color="onHeaderMuted" numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.spacer} />
        )}
        {shareLabel !== undefined && onShare !== undefined ? (
          <View style={styles.end}>
            <IconButton icon="share" label={shareLabel} onPress={onShare} ground="header" />
          </View>
        ) : null}
      </View>
    </View>
  );
}
