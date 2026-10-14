import { Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text, radius, space } from '@/ui';
import { tintColor } from './categoryGroups';
import type { ItemCategory } from './items';

/** The banner's least height, shared with the loading skeleton. */
export const SHELF_BANNER_HEIGHT = 88;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    banner: {
      marginHorizontal: space[4],
      minHeight: SHELF_BANNER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
    },
    words: { flex: 1, minWidth: 0, gap: 2 },
    go: { paddingHorizontal: space[2] },
    pressed: { opacity: 0.85 },
  });

/**
 * A wide banner between the shelves (ADR 0055, step 8): the monthly ration, one tap away. It opens the staples row's own screen the
 * way a "See all" does. It breaks up five shelves in a row, and says what the shops can pack for the month.
 */
export function ShelfBanner({ onShop }: { onShop: (category: ItemCategory) => void }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="button"
      aria-label={`${t('home.banner.title')}. ${t('home.featured.rationBody')}. ${t('home.featured.shop')}`}
      onPress={() => {
        onShop('staples');
      }}
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: tintColor(colors, 'staples') },
        pressed && styles.pressed,
      ]}
    >
      <NativeText allowFontScaling={false} aria-hidden style={{ fontSize: 40, lineHeight: 48 }}>
        {'\u{1F33E}'}
      </NativeText>
      <View style={styles.words}>
        <Text variant="label" numberOfLines={2}>
          {t('home.banner.title')}
        </Text>
        <Text variant="fine" color="inkMuted" numberOfLines={2}>
          {t('home.featured.rationBody')}
        </Text>
      </View>
      <View style={styles.go}>
        <Text variant="strong" color="action" numberOfLines={1}>
          {t('home.featured.shop')}
        </Text>
      </View>
    </Pressable>
  );
}
