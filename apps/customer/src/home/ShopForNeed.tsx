import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, RowTitle, Text, radius, space } from '@/ui';
import { tintColor } from './categoryGroups';
import { liveNeeds, needBlurb, type Need } from './needs';
import { useHomeItems } from './items';

/** A card's height: every card is the same, so the grid is level and the loading skeleton is the same size. */
export const NEED_CARD_HEIGHT = 136;
const ARROW = 32;
/** The main picture, and the smaller one beside it. */
const MAIN = 44;
const SIDE = 30;
/** The room between cards, two to a row. */
const GAP = space[3];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4], gap: space[1] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: space[4] },
    // Two to a row: half the width less half the gap.
    cell: { width: '47.8%', flexGrow: 1 },
    card: {
      height: NEED_CARD_HEIGHT,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      padding: space[3],
      overflow: 'hidden',
    },
    pressed: { opacity: 0.85 },
    // The words sit at the top and never run under the picture at the bottom right.
    words: { gap: 2, paddingRight: space[1] },
    art: {
      position: 'absolute',
      right: space[2],
      bottom: space[1],
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    arrow: {
      position: 'absolute',
      left: space[3],
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
  const tint = tintColor(colors, need.tint);

  return (
    <Pressable
      role="button"
      aria-label={`${t(need.label)}. ${blurb}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: tint }, pressed && styles.pressed]}
    >
      <View style={styles.words}>
        <Text variant="label" color="ink" numberOfLines={2}>
          {t(need.label)}
        </Text>
        <Text variant="fine" color="inkMuted" numberOfLines={2}>
          {blurb}
        </Text>
      </View>
      <View style={styles.art} aria-hidden>
        <NativeText allowFontScaling={false} style={{ fontSize: MAIN, lineHeight: MAIN + 8 }}>
          {need.emoji}
        </NativeText>
        <NativeText
          allowFontScaling={false}
          style={{ fontSize: SIDE, lineHeight: SIDE + 6, marginLeft: -space[1] }}
        >
          {need.extras[0]}
        </NativeText>
      </View>
      <View style={styles.arrow} aria-hidden>
        <Icon name="chevronRight" color={colors.ink} size={18} />
      </View>
    </Pressable>
  );
}

/**
 * "Picks for your routine" on Home (ADR 0044, ADR 0047, ADR 0055 step 6): the moments of a day, each opening a page of shelves
 * with every brand, as soft tinted cards two to a row under the same dotted-line title the other rows have, with a line saying what they are. A need cuts
 * across categories ("Tea Break" is milk, sugar, biscuits, rusk and namkeen): each card opens its own page. With no need in stock the
 * section is not shown. The needs and their kinds are the same data as before.
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
        <Text variant="small" color="inkMuted">
          {t('home.shopForNeed.sub')}
        </Text>
      </View>
      <View style={styles.grid}>
        {needs.map((entry) => (
          <View key={entry.id} style={styles.cell}>
            <NeedCard
              need={entry}
              onPress={() => {
                router.push({ pathname: '/need/[id]', params: { id: entry.id } });
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
