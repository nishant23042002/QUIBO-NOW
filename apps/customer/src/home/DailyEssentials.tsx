import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Pressable, Text as NativeText, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  DietMark,
  RowTitle,
  RowTitleSkeleton,
  SegmentedTabs,
  Skeleton,
  Text,
  fontSize,
  gridCardWidth as gridWidth,
  leading,
  radius,
  space,
  useProductCardMetrics,
} from '@/ui';
import { useTintOf } from './categories';
import type { EssentialTabId } from './essentials';
import { liveEssentialTabs, openingTab } from './essentials';
import { useHomeItems, type HomeItem } from './items';
import { ItemControl } from './ItemTile';

/** The picture square at the start of a tile. */
const PICTURE = 40;
const NAME_LINES = 2;
const PADDING = space[2];
/** The gap between tiles, in both directions: tighter than the other grids, so six tiles fit a short stretch of the page. */
const GAP = space[2];
/** A tile's border is one hairline on each side. */
const BORDER = 1;
/** The compact ADD is 28 dp tall; the price block beside it is never shorter. */
const CONTROL_HEIGHT = 28;
/** The segmented control's height: a 40 dp option in a track with 4 of padding all round. */
const TABS_HEIGHT = 48;

/** A tile's width: two to a row between the page's gutters, with the strip's own gap. */
function tileWidth(screen: number): number {
  return gridWidth(screen, { columns: 2, gutter: space[4], gap: GAP });
}

/**
 * A tile's height, from the same measurements `ProductCard` uses for its name and pack lines and the text styles' own line heights
 * (so a Hindi or Marathi tile is as tall as it needs to be): the picture or the name and pack beside it, whichever is taller, then
 * the price block (price over the struck MRP) with the control beside it. Every tile has it, so the grid is level, and the loading
 * skeleton uses it too.
 */
function useEssentialTileMetrics(width: number) {
  const { locale } = useLanguage();
  const { line, nameLine } = useProductCardMetrics(width);
  const script = locale === 'en' ? 'latin' : 'devanagari';
  const priceLine = Math.round(fontSize.base * leading[script].tight);
  const mrpLine = Math.round(fontSize.xs * leading[script].tight);
  const words = nameLine * NAME_LINES + line + space[1];
  const priceBlock = Math.max(CONTROL_HEIGHT, priceLine + mrpLine);
  const height = PADDING * 2 + BORDER * 2 + Math.max(PICTURE, words) + space[2] + priceBlock;
  return { height, priceBlock };
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: space[4] },
    tile: {
      gap: space[2],
      padding: PADDING,
      borderRadius: radius.md,
      borderWidth: BORDER,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    open: { flexDirection: 'row', gap: space[2], alignItems: 'flex-start' },
    picture: {
      width: PICTURE,
      height: PICTURE,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    diet: { position: 'absolute', top: 2, right: 2 },
    words: { flex: 1, minWidth: 0, gap: space[1] },
    // The price over its struck MRP on the left and ADD on the right.
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
    },
    price: { flexShrink: 1, minWidth: 0 },
    pressed: { opacity: 0.85 },
  });

/**
 * One daily essential, compact: a small picture, the name and pack, and under them the price with the MRP struck
 * through (when there is a saving) and ADD (turning into the stepper in place). The picture and words open the item's own page; the
 * control writes to the cart exactly as `ItemTile`'s does, so the count shows in every card of the item and in the cart bar.
 */
const EssentialTile = memo(function EssentialTile({
  item,
  width,
}: {
  item: HomeItem;
  width: number;
}) {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const tintOf = useTintOf();
  const { height, priceBlock } = useEssentialTileMetrics(width);
  const pack = item.sizesLabel === undefined ? item.pack : `${item.pack} · ${item.sizesLabel}`;
  const mrp = item.mrp !== undefined && item.mrp > item.price ? item.mrp : undefined;

  return (
    <View style={[styles.tile, { width, height }]}>
      <Pressable
        role="button"
        aria-label={`${item.fullName}. ${pack}`}
        onPress={() => {
          router.push({ pathname: '/product/[id]', params: { id: item.id } });
        }}
        style={({ pressed }) => [styles.open, pressed && styles.pressed]}
      >
        <View style={[styles.picture, { backgroundColor: tintOf(item.category) }]}>
          <NativeText
            allowFontScaling={false}
            aria-hidden
            style={{ fontSize: 24, lineHeight: 30, textAlign: 'center' }}
          >
            {item.emoji}
          </NativeText>
          <View style={styles.diet} pointerEvents="none">
            <DietMark kind={item.diet.kind} label={item.diet.label} size={12} />
          </View>
        </View>
        <View style={styles.words}>
          <Text variant="strong" tight numberOfLines={NAME_LINES}>
            {item.fullName}
          </Text>
          <Text variant="fine" tight color="inkMuted" numberOfLines={1}>
            {pack}
          </Text>
        </View>
      </Pressable>
      <View style={[styles.priceRow, { minHeight: priceBlock }]}>
        <View
          style={styles.price}
          accessible
          aria-label={
            mrp === undefined
              ? formatRupees(item.price)
              : `${formatRupees(item.price)}, was ${formatRupees(mrp)}`
          }
        >
          <Text variant="label" tight numberOfLines={1}>
            {formatRupees(item.price)}
          </Text>
          {mrp !== undefined ? (
            <Text variant="fine" tight color="inkMuted" strike numberOfLines={1}>
              {formatRupees(mrp)}
            </Text>
          ) : null}
        </View>
        <ItemControl item={item} compact />
      </View>
    </View>
  );
});

/** The minimum height of the grid: as many rows as the fullest tab needs, so choosing a tab does not move what is under it. */
function gridMinHeight(rows: number, tile: number): number {
  return rows * tile + Math.max(0, rows - 1) * GAP;
}

/**
 * "Daily essentials" on Home (ADR 0048): the things the town buys every day, to add without searching or leaving Home. One
 * segmented control (Morning, Cooking, Evening) over a two-column grid of up to six compact tiles; it opens on the tab that suits the
 * time of day. Each tile has its own ADD and stepper. Items that are not stocked or are out of stock are left out, a tab with nothing
 * is left out, and with no tab left the section is not shown.
 */
export function DailyEssentials() {
  const { t } = useLanguage();
  const { width: screen } = useWindowDimensions();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const live = liveEssentialTabs(items);
  const [picked, setPicked] = useState<EssentialTabId | undefined>(undefined);
  const width = tileWidth(screen);
  const { height } = useEssentialTileMetrics(width);

  if (live.length === 0) return null;

  const current =
    live.find((entry) => entry.tab.id === picked) ?? openingTab(live, new Date().getHours());
  if (current === undefined) return null;
  const rows = Math.ceil(Math.max(...live.map((entry) => entry.items.length)) / 2);

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.essentials.title')} />
      </View>
      <View style={styles.pad}>
        <SegmentedTabs
          label={t('home.essentials.title')}
          options={live.map((entry) => ({ key: entry.tab.id, label: t(entry.tab.label) }))}
          selected={current.tab.id}
          onSelect={(key) => {
            setPicked(live.find((entry) => entry.tab.id === key)?.tab.id);
          }}
        />
      </View>
      <View style={[styles.grid, { minHeight: gridMinHeight(rows, height) }]}>
        {current.items.map((item) => (
          <EssentialTile key={item.id} item={item} width={width} />
        ))}
      </View>
    </View>
  );
}

/**
 * The strip's loading shape: the title, the control and as many tiles as the opening tab will have, each the height of the real
 * tile. The segmented control is as tall as the real one (a 40 dp option in a track with 4 of padding all round).
 */
export function DailyEssentialsSkeleton() {
  const { t } = useLanguage();
  const { width: screen } = useWindowDimensions();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const live = liveEssentialTabs(items);
  const width = tileWidth(screen);
  const { height } = useEssentialTileMetrics(width);
  const opening = openingTab(live, new Date().getHours());
  const rows = live.length === 0 ? 0 : Math.ceil(Math.max(...live.map((e) => e.items.length)) / 2);

  if (opening === undefined) return null;

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitleSkeleton title={t('home.essentials.title')} />
      </View>
      <View style={styles.pad}>
        <Skeleton height={TABS_HEIGHT} rounded={radius.md} />
      </View>
      <View style={[styles.grid, { minHeight: gridMinHeight(rows, height) }]}>
        {opening.items.map((item) => (
          <Skeleton key={item.id} width={width} height={height} rounded={radius.md} />
        ))}
      </View>
    </View>
  );
}
