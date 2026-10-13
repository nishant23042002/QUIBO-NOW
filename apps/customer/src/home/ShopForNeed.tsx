import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { RowTitle, Text, radius, space } from '@/ui';
import { tintColor } from './categoryGroups';
import { liveNeeds, needBlurb, type Need } from './departments';
import { useHomeItems } from './items';

/** A card's width, and the height the loading skeleton gives it (the card itself grows if a longer name needs the room). */
export const NEED_CARD_WIDTH = 156;
export const NEED_CARD_HEIGHT = 168;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    card: {
      width: NEED_CARD_WIDTH,
      minHeight: NEED_CARD_HEIGHT,
      gap: space[2],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
    },
    pressed: { opacity: 0.85 },
    picture: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
  });

function NeedCard({ need, onPress }: { need: Need; onPress: () => void }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const blurb = needBlurb(need)
    .map((label) => t(label))
    .join(', ');

  return (
    <Pressable
      role="button"
      aria-label={`${t(need.label)}. ${blurb}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: tintColor(colors, need.tint) },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.picture} aria-hidden>
        <NativeText allowFontScaling={false} style={{ fontSize: 24, lineHeight: 30 }}>
          {need.emoji}
        </NativeText>
      </View>
      <Text variant="subheading" color="onHeader" numberOfLines={2}>
        {t(need.label)}
      </Text>
      <Text variant="small" color="onHeaderMuted" numberOfLines={2}>
        {blurb}
      </Text>
    </Pressable>
  );
}

/**
 * "Shop for your need" on Home (ADR 0044): a swipeable row of tinted cards, one per need that has something in stock, under the same
 * dotted-line title the other rows have. A need cuts across departments ("Tea time" is milk, sugar, biscuits and chips): each card
 * opens its own page. With no need in stock the section is not shown.
 */
export function ShopForNeed() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const needs = liveNeeds(useHomeItems());

  if (needs.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.shopForNeed.title')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {needs.map((entry) => (
            <NeedCard
              key={entry.id}
              need={entry}
              onPress={() => {
                router.push({ pathname: '/need/[id]', params: { id: entry.id } });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
