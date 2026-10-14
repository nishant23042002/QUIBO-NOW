import { Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { RowTitle, Text, radius, space } from '@/ui';
import { bestsellerTiles } from './bestsellerTiles';
import { CATEGORIES, type Category } from './catalogueTree';
import { tintColor } from './categoryGroups';
import { resolveCategories } from './categoryLists';
import { useHomeItems } from './items';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    // Three across, two rows. A cell's own side padding makes the gap, so the row always fits the width the phone gives it.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: space[4] - space[3] / 2,
      rowGap: space[5],
    },
    cell: { width: '33.3333%', paddingHorizontal: space[3] / 2 },
    tile: { alignItems: 'center', gap: space[3] },
    box: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radius.lg,
      padding: space[2],
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      alignContent: 'center',
    },
    picture: { width: '50%', alignItems: 'center' },
    more: {
      position: 'absolute',
      bottom: -space[2] - 2,
      alignSelf: 'center',
      paddingHorizontal: space[2],
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.8 },
  });

/**
 * "Bestsellers" (ADR 0055, step 3): the town's categories as collage tiles, three across, each a little crowd of its own products
 * with "+N more" on its edge and its name under it. A tile opens the category's own screen. It is a way in for someone who knows
 * the kind of thing they want and not the brand.
 */
export function Bestsellers({ onCategory }: { onCategory: (category: Category) => void }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const tiles = bestsellerTiles(items, resolveCategories(items, CATEGORIES));
  if (tiles.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.bestsellers.title')} />
      </View>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <View key={tile.category.id} style={styles.cell}>
            <Pressable
              role="button"
              aria-label={t(tile.category.label)}
              onPress={() => {
                onCategory(tile.category);
              }}
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            >
              <View
                style={[styles.box, { backgroundColor: tintColor(colors, tile.category.tint) }]}
                aria-hidden
              >
                {tile.emojis.map((emoji) => (
                  <View key={emoji} style={styles.picture}>
                    <NativeText allowFontScaling={false} style={{ fontSize: 26, lineHeight: 34 }}>
                      {emoji}
                    </NativeText>
                  </View>
                ))}
                {tile.more > 0 ? (
                  <View style={styles.more}>
                    <Text variant="caption" numberOfLines={1} maxFontSizeMultiplier={1.2}>
                      {t('home.bestsellers.more', { count: tile.more })}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="caption" align="center" numberOfLines={2} maxFontSizeMultiplier={1.2}>
                {t(tile.category.label)}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
