import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, RowTitle, Text, radius, space } from '@/ui';
import { tintColor } from './categoryGroups';
import { liveNeeds, needBlurb, type Need } from './needs';
import { useHomeItems } from './items';

/** A card's width, and the height the loading skeleton gives it (the card itself grows if a longer name needs the room). */
export const NEED_CARD_WIDTH = 164;
export const NEED_CARD_HEIGHT = 188;
/** The picture's size, and the round arrow's. */
const PICTURE = 52;
const ARROW = 36;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    // The text sits at the bottom, the picture at the top right with a corner of it cropped by the card, and a round arrow at the
    // bottom right: the card is the button, the arrow only says so.
    card: {
      width: NEED_CARD_WIDTH,
      minHeight: NEED_CARD_HEIGHT,
      justifyContent: 'flex-end',
      gap: space[1],
      padding: space[3],
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    pressed: { opacity: 0.85 },
    picture: {
      position: 'absolute',
      top: -space[1],
      right: -space[1],
      width: PICTURE + space[3],
      height: PICTURE + space[3],
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Keeps the kinds from running under the arrow.
    kinds: { paddingRight: ARROW + space[2] },
    arrow: {
      position: 'absolute',
      right: space[3],
      bottom: space[3],
      width: ARROW,
      height: ARROW,
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
        <NativeText allowFontScaling={false} style={{ fontSize: PICTURE, lineHeight: PICTURE + 8 }}>
          {need.emoji}
        </NativeText>
      </View>
      <Text variant="subheading" color="onHeader" numberOfLines={2}>
        {t(need.label)}
      </Text>
      <View style={styles.kinds}>
        <Text variant="small" color="onHeaderMuted" numberOfLines={2}>
          {blurb}
        </Text>
      </View>
      <View style={styles.arrow} aria-hidden>
        <Icon name="chevronRight" color={colors.ink} size={18} />
      </View>
    </Pressable>
  );
}

/**
 * "Shop for your need" on Home (ADR 0044, ADR 0047): a swipeable row of soft tinted cards, one per need that has something in stock, under the same
 * dotted-line title the other rows have. A need cuts across categories ("Tea time" is milk, sugar, biscuits and chips): each card
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
