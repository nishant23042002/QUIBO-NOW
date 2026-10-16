import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, type ThemeColors } from '@/theme';
import { IconButton } from './IconButton';
import { HeaderGradient } from './HeaderGradient';
import { HeaderThumb, type HeaderThumbContent } from './HeaderThumb';
import { ScreenStatusBar } from './ScreenStatusBar';
import { Text } from './Text';
import { HEADER_HEIGHT, space } from './tokens';

export interface CategoryHeaderProps {
  title: string;
  /** Under the title, for example when the order arrives. */
  subtitle?: string;
  backLabel: string;
  onBack: () => void;
  /** Give both to show the search button at the end. A page that has nothing to search leaves them out. */
  searchLabel?: string;
  onSearch?: () => void;
  /** A small round picture that slides in beside the title once the page is scrolled (`thumbShown`), and folds away at the top. */
  thumb?: HeaderThumbContent;
  thumbShown?: boolean;
}

/** An icon button's circle is 38 dp inside a 48 dp touch area, so the circle sits this far in from the area's edge. */
const CIRCLE_INSET = 5;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // The same deep aubergine the Home header wears, with a square lower edge: the screen under it is a list that runs up to it.
    bar: { backgroundColor: c.headerBg },
    row: { minHeight: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    back: { marginLeft: -CIRCLE_INSET },
    title: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
    words: { flex: 1, minWidth: 0 },
    end: { marginRight: -CIRCLE_INSET },
  });

/**
 * The header of a category screen: aubergine like Home's, with a back button, the category's name with a line under it, and a search
 * button. The colour of the category itself lives in the page under it (the right-hand side), not here.
 */
export function CategoryHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  searchLabel,
  onSearch,
  thumb,
  thumbShown = false,
}: CategoryHeaderProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);

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
      <ScreenStatusBar style="header" />
      <View style={styles.row}>
        <View style={styles.back}>
          <IconButton icon="back" label={backLabel} onPress={onBack} ground="header" />
        </View>
        <View style={styles.title}>
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
        {searchLabel !== undefined && onSearch !== undefined ? (
          <View style={styles.end}>
            <IconButton icon="search" label={searchLabel} onPress={onSearch} ground="header" />
          </View>
        ) : null}
      </View>
    </View>
  );
}
