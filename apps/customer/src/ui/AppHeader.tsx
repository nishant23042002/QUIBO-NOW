import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, type ThemeColors } from '@/theme';
import { HeaderLogo } from './brand/HeaderLogo';
import { IconButton } from './IconButton';
import { Text } from './Text';
import { HEADER_HEIGHT, space } from './tokens';

export interface AppHeaderProps {
  /** On the first screen: the QUIBO NOW logo, named for screen readers. Leave out on other screens. */
  logoLabel?: string;
  /** On other screens: the screen's title. */
  title?: string;
  /** Give both to show a back button. */
  onBack?: () => void;
  backLabel?: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bar: { backgroundColor: c.chrome },
    row: { height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center' },
    back: { marginLeft: -space[2] },
    title: { flex: 1 },
    spacer: { flex: 1 },
  });

/**
 * The header of every screen. Its height is the same every time: the status bar's height from the
 * phone, plus a fixed 56 dp. The dark colour is painted behind the status bar, so the app fills the
 * whole screen instead of leaving a strip at the top.
 */
export function AppHeader({ logoLabel, title, onBack, backLabel }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);

  return (
    <View
      role="banner"
      style={[
        styles.bar,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left + space[4],
          paddingRight: insets.right + space[2],
        },
      ]}
    >
      {/* This header is dark in both themes, so the status bar text is light. */}
      <StatusBar style="light" />
      <View style={styles.row}>
        {onBack !== undefined && backLabel !== undefined ? (
          <View style={styles.back}>
            <IconButton icon="back" label={backLabel} onPress={onBack} />
          </View>
        ) : null}
        {logoLabel !== undefined ? <HeaderLogo label={logoLabel} /> : null}
        {title !== undefined ? (
          <View style={styles.title}>
            <Text variant="label" color="onChrome" numberOfLines={1} role="heading">
              {title}
            </Text>
          </View>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}
