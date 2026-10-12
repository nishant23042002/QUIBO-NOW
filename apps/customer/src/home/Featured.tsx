import { useRouter } from 'expo-router';
import { Pressable, Text as NativeText, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { RowTitle, Text, radius, space } from '@/ui';
import { tileRoute, tintColor } from './categoryGroups';
import { FEATURED } from './featuredPicks';
import type { ItemCategory } from './items';

const CARD_WIDTH = 232;
const PICTURE = 56;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    card: {
      width: CARD_WIDTH,
      minHeight: 96,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      padding: space[4],
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
    },
    words: { flex: 1, minWidth: 0, gap: space[1] },
    picture: { width: PICTURE, height: PICTURE, alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.85 },
  });

/**
 * "Featured this week": a few picks, each a tinted card with a title, a line under it and a picture, in one swipeable row under the
 * same dotted-line title as every row. A pick opens a category on Home, or search for a word, the way a category tile does.
 */
export function Featured({ onCategory }: { onCategory: (category: ItemCategory) => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.featured.title')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {FEATURED.map((pick) => (
            <Pressable
              key={pick.title}
              role="button"
              aria-label={`${t(pick.title)}. ${t(pick.body)}`}
              onPress={() => {
                if (pick.target.kind === 'category') onCategory(pick.target.category);
                else router.push(tileRoute(pick.target, String(Date.now())));
              }}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: tintColor(colors, pick.tint) },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.words}>
                <Text variant="strong" numberOfLines={2}>
                  {t(pick.title)}
                </Text>
                <Text variant="caption" color="inkMuted" numberOfLines={2}>
                  {t(pick.body)}
                </Text>
              </View>
              <View style={styles.picture} aria-hidden>
                <NativeText
                  allowFontScaling={false}
                  style={{ fontSize: PICTURE * 0.7, lineHeight: PICTURE * 0.9 }}
                >
                  {pick.emoji}
                </NativeText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
