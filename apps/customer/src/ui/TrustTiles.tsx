import { ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface TrustTile {
  key: string;
  icon: IconName;
  /** For example "Verified shop". */
  title: string;
  /** One short line under it, for example "Checked by Quibo". */
  body: string;
}

export interface TrustTilesProps {
  tiles: readonly TrustTile[];
  /**
   * soft: pale pistachio tiles, as on a product page. brand: the soft aubergine of the Home header, with the same text
   * colours the header uses, so the tiles read as part of Quibo's own look.
   */
  tone?: 'soft' | 'brand';
  /**
   * Lay the tiles in one row that slides sideways, each a compact card (a small icon beside the title, the line under it), for
   * a place that has little room. Without it they are a two-column grid.
   */
  scroll?: boolean;
  /** With `scroll`: how far the row runs past its container on each side, so it reaches the container's edges. */
  bleed?: number;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
    tile: {
      flexGrow: 1,
      flexBasis: '46%',
      gap: space[2],
      padding: space[4],
      borderRadius: radius.lg,
    },
    soft: { backgroundColor: c.accentSubtle },
    brand: { backgroundColor: c.headerBg },
    icon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
    words: { gap: space[1] },
    // The compact card of the sideways row.
    slide: { width: SLIDE_WIDTH, gap: space[2], padding: space[3], borderRadius: radius.lg },
    slideHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    slideIcon: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
    slideTitle: { flex: 1, minWidth: 0 },
    slides: { flexDirection: 'row', gap: space[2] },
  });

/** How wide a compact card is: two and a bit show at once on a phone, so the row plainly slides. */
const SLIDE_WIDTH = 176;

/**
 * Four short promises in a two-by-two grid, each with an icon: who checked the shop, where it is packed, when it arrives
 * and what happens if it is not right.
 */
export function TrustTiles({ tiles, tone = 'soft', scroll = false, bleed = 0 }: TrustTilesProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const brand = tone === 'brand';

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -bleed }}
        contentContainerStyle={[styles.slides, { paddingHorizontal: bleed }]}
      >
        {tiles.map((tile) => (
          <View
            key={tile.key}
            style={[styles.slide, brand ? styles.brand : styles.soft]}
            accessible
            aria-label={`${tile.title}. ${tile.body}`}
          >
            <View style={styles.slideHead}>
              <View style={styles.slideIcon}>
                <Icon
                  name={tile.icon}
                  color={brand ? colors.onHeader : colors.accentInk}
                  size={18}
                />
              </View>
              <View style={styles.slideTitle}>
                <Text variant="strong" color={brand ? 'onHeader' : 'ink'} numberOfLines={2}>
                  {tile.title}
                </Text>
              </View>
            </View>
            <Text variant="small" color={brand ? 'onHeaderMuted' : 'inkMuted'}>
              {tile.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <View
          key={tile.key}
          style={[styles.tile, brand ? styles.brand : styles.soft]}
          accessible
          aria-label={`${tile.title}. ${tile.body}`}
        >
          <View style={styles.icon}>
            <Icon name={tile.icon} color={brand ? colors.onHeader : colors.accentInk} size={20} />
          </View>
          <View style={styles.words}>
            <Text variant="strong" color={brand ? 'onHeader' : 'ink'}>
              {tile.title}
            </Text>
            <Text variant="small" color={brand ? 'onHeaderMuted' : 'inkMuted'}>
              {tile.body}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
