import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, RowTitle, Text, radius, space } from '@/ui';
import { tintColor } from './categoryGroups';
import { liveNeeds, needBlurb, type Need } from './needs';
import { useHomeItems } from './items';

/** A card's width and height: every card is the same, so the row is level and the loading skeleton is the same size. */
export const NEED_CARD_WIDTH = 164;
export const NEED_CARD_HEIGHT = 188;
/** The text plate's height: its padding, a line of name and two of kinds. It is fixed, so every card's text sits on the same lines. */
const PLATE = 96;
const ARROW = 32;
/** The main picture, and the two beside it. */
const MAIN = 68;
const SIDE = 40;
/** How much of the card's own colour the plate lets the art show through: nearly none, so the words are always readable. */
const PLATE_ALPHA = 'EB';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    card: {
      width: NEED_CARD_WIDTH,
      height: NEED_CARD_HEIGHT,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    pressed: { opacity: 0.85 },
    // The art: one main picture and two smaller ones, in the same places on every card.
    art: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: NEED_CARD_HEIGHT - PLATE + 16,
    },
    main: {
      position: 'absolute',
      top: space[3],
      left: (NEED_CARD_WIDTH - MAIN - space[2]) / 2,
      width: MAIN + space[2],
      alignItems: 'center',
    },
    sideLeft: { position: 'absolute', top: 52, left: space[3] },
    sideRight: { position: 'absolute', top: 30, right: space[3] },
    // The words lie over the lower part of the art on a plate of the card's own colour, so the picture runs behind them.
    plate: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: PLATE,
      // Top-aligned, so every card's name sits on the same line whatever the kinds under it take.
      justifyContent: 'flex-start',
      gap: 2,
      paddingHorizontal: space[3],
      paddingTop: space[2],
      paddingBottom: space[3],
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

/** A card's colour with a little of the art let through, for the plate. Colours are `#RRGGBB`; anything else is left as it is. */
function withAlpha(colour: string, alpha: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(colour) ? `${colour}${alpha}` : colour;
}

function NeedCard({ need, onPress }: { need: Need; onPress: () => void }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const blurb = needBlurb(need)
    .map((label) => t(label))
    .join(', ');
  const tint = tintColor(colors, need.tint);

  return (
    <Pressable
      role="button"
      aria-label={`${t(need.label)}. ${blurb}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: tint }, pressed && styles.pressed]}
    >
      <View style={styles.art} aria-hidden>
        <View style={styles.sideLeft}>
          <NativeText allowFontScaling={false} style={{ fontSize: SIDE, lineHeight: SIDE + 8 }}>
            {need.extras[0]}
          </NativeText>
        </View>
        <View style={styles.sideRight}>
          <NativeText allowFontScaling={false} style={{ fontSize: SIDE, lineHeight: SIDE + 8 }}>
            {need.extras[1]}
          </NativeText>
        </View>
        <View style={styles.main}>
          <NativeText allowFontScaling={false} style={{ fontSize: MAIN, lineHeight: MAIN + 10 }}>
            {need.emoji}
          </NativeText>
        </View>
      </View>
      <View style={[styles.plate, { backgroundColor: withAlpha(tint, PLATE_ALPHA) }]}>
        <Text variant="label" color="onHeader" numberOfLines={2}>
          {t(need.label)}
        </Text>
        <View style={styles.kinds}>
          <Text variant="fine" color="onHeaderMuted" numberOfLines={2}>
            {blurb}
          </Text>
        </View>
        <View style={styles.arrow} aria-hidden>
          <Icon name="chevronRight" color={colors.ink} size={18} />
        </View>
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
