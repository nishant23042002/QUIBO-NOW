import { formatRupees, money } from '@quibo/contracts';
import { Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';
import { tintColor } from './categoryGroups';
import type { MainCategoryId } from './catalogueTree';
import { heroTiles, lowestPrice, type HeroTile } from './hero';
import { useHomeItems } from './items';
import { liveNeeds, type NeedId } from './needs';

/** One small tile's height. The tall tile is two of them and the gap between. */
const ROW = 112;
const GAP = space[2];
/** The strip's round "go" button. */
const GO = 36;
const AVATAR = 34;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: space[4], gap: space[2] },
    title: { paddingBottom: space[1] },
    grid: { flexDirection: 'row', gap: GAP },
    tall: { flex: 1.15, height: ROW * 2 + GAP },
    col: { flex: 2, gap: GAP },
    pair: { flexDirection: 'row', gap: GAP, height: ROW },
    small: { flex: 1, height: ROW },
    tile: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: radius.lg,
      // A fine, light border, so each tile reads as its own object against the page.
      borderWidth: 1,
      borderColor: c.line,
      padding: space[2] + 2,
    },
    pressed: { opacity: 0.85 },
    art: { position: 'absolute', right: space[2], bottom: space[1] },
    // Sits just above the price tag, so a label or a second line that wraps (a narrow phone, large text) never runs under it.
    tallArt: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: space[2] + 56 + space[1],
      alignItems: 'center',
    },
    price: {
      position: 'absolute',
      left: space[2],
      right: space[2],
      bottom: space[2],
      alignItems: 'center',
      paddingVertical: space[1],
      borderRadius: radius.md,
      backgroundColor: c.chrome,
    },
    strip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[2] + 2,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    avatars: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: AVATAR + 4,
      height: AVATAR + 4,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlap: { marginLeft: -space[2] },
    words: { flex: 1, minWidth: 0 },
    go: {
      width: GO,
      height: GO,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
  });

export interface HeroMosaicProps {
  /** The names of the shops, open ones first, for the strip's avatars and its line. */
  shopNames: readonly string[];
  /** A category tile was pressed: Home shows that category. */
  onCategory: (id: MainCategoryId) => void;
  /** A need tile was pressed: its page opens. */
  onNeed: (id: NeedId) => void;
  /** The strip was pressed: the shops open under the header. */
  onMeetShops: () => void;
}

/**
 * "Picks for your routine": the block under Home's category tabs, drawn on the header's own colour (ADR 0055). A tall tile (morning
 * milk, with the lowest price in town) and the four moments (Tea Break, Breakfast Ready, Cook Today, Movie Night), each opening its
 * own page, then a strip that opens the shops. The pictures are emoji until each tile has a picture of its own.
 */
export function HeroMosaic({ shopNames, onCategory, onNeed, onMeetShops }: HeroMosaicProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();

  const open = (tile: HeroTile) => {
    if (tile.target.kind === 'category') onCategory(tile.target.id);
    else onNeed(tile.target.id);
  };

  const renderTile = (tile: HeroTile, tall: boolean) => {
    const from = tile.fromType === undefined ? undefined : lowestPrice(items, tile.fromType);
    const label = t(tile.label);
    const sub = tile.sub === undefined ? undefined : t(tile.sub);
    return (
      <Pressable
        key={tile.id}
        role="button"
        aria-label={sub === undefined ? label : `${label}. ${sub}`}
        onPress={() => {
          open(tile);
        }}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: tintColor(colors, tile.tint) },
          pressed && styles.pressed,
        ]}
      >
        <Text variant="strong" color="ink" numberOfLines={tall ? 3 : 2}>
          {label}
        </Text>
        {sub !== undefined ? (
          <Text variant="fine" color="inkMuted" numberOfLines={2}>
            {sub}
          </Text>
        ) : null}
        {tall ? (
          <View style={styles.tallArt} aria-hidden>
            <NativeText allowFontScaling={false} style={{ fontSize: 52, lineHeight: 62 }}>
              {tile.emoji}
            </NativeText>
          </View>
        ) : (
          <View style={styles.art} aria-hidden>
            <NativeText allowFontScaling={false} style={{ fontSize: 40, lineHeight: 48 }}>
              {tile.emoji}
            </NativeText>
          </View>
        )}
        {tall && from !== undefined ? (
          <View style={styles.price}>
            <Text variant="caption" color="onChrome" numberOfLines={1}>
              {t('home.hero.from')}
            </Text>
            <Text variant="label" color="accent" numberOfLines={1}>
              {formatRupees(money(from))}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  const [milk, first, second, third, fourth] = heroTiles(liveNeeds(items));
  const names = shopNames.slice(0, 2).join(', ');
  const more = shopNames.length - 2;
  const strip = more > 0 ? t('home.hero.shopsSub', { names, count: more }) : shopNames.join(', ');
  const tones = [colors.tagBg, colors.accent, colors.chrome] as const;

  return (
    <View style={styles.wrap}>
      <View style={styles.title}>
        <Text variant="caption" color="onHeaderMuted" numberOfLines={1}>
          {t('home.hero.title')}
        </Text>
      </View>
      <View style={styles.grid}>
        <View style={styles.tall}>{milk !== undefined ? renderTile(milk, true) : null}</View>
        <View style={styles.col}>
          <View style={styles.pair}>
            <View style={styles.small}>
              {first !== undefined ? renderTile(first, false) : null}
            </View>
            <View style={styles.small}>
              {second !== undefined ? renderTile(second, false) : null}
            </View>
          </View>
          <View style={styles.pair}>
            <View style={styles.small}>
              {third !== undefined ? renderTile(third, false) : null}
            </View>
            <View style={styles.small}>
              {fourth !== undefined ? renderTile(fourth, false) : null}
            </View>
          </View>
        </View>
      </View>
      {shopNames.length > 0 ? (
        <Pressable
          role="button"
          aria-label={`${t('home.hero.shopsTitle')}. ${strip}`}
          onPress={onMeetShops}
          style={({ pressed }) => [styles.strip, pressed && styles.pressed]}
        >
          <View style={styles.avatars} aria-hidden>
            {shopNames.slice(0, 3).map((name, index) => (
              <View
                key={`${name}-${index}`}
                style={[
                  styles.avatar,
                  index > 0 && styles.overlap,
                  { backgroundColor: tones[index % tones.length] ?? colors.accent },
                ]}
              >
                <Text
                  variant="caption"
                  color={index === 0 ? 'tagFg' : index === 1 ? 'onAccent' : 'onChrome'}
                  maxFontSizeMultiplier={1}
                >
                  {Array.from(name)[0] ?? ''}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.words}>
            <Text variant="strong" color="ink" numberOfLines={1}>
              {t('home.hero.shopsTitle')}
            </Text>
            <Text variant="fine" color="inkMuted" numberOfLines={2}>
              {strip}
            </Text>
          </View>
          <View style={styles.go} aria-hidden>
            <Icon name="chevronRight" color={colors.onAccent} size={18} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
