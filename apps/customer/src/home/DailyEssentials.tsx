import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  Button,
  DietMark,
  LetteredTitle,
  SegmentedTabs,
  Skeleton,
  TAP_MIN,
  Text,
  WEIGHT_RULE,
  countRule,
  fontSize,
  leading,
  radius,
  space,
  stepQuantity,
} from '@/ui';
import { useCart, useCartActions, useQuantity } from './CartProvider';
import { useTintOf } from './categories';
import type { EssentialTabId } from './essentials';
import { essentialBasket, essentialLeft, liveEssentialTabs, openingTab } from './essentials';
import { useHomeItems, type HomeItem } from './items';
import { ItemControl } from './ItemTile';

/** The picture in a tile, the tick box, and the room round and between tiles. */
const PICTURE = 64;
const CHECK = 24;
const PADDING = space[2];
const GAP = space[2];
const BORDER = 2;
/** The one line under the name: the price, and the pack or the stepper. It is as tall as a thumb needs. */
const FOOT = 40;
/** The segmented control's height: a 40 dp option in a track with 4 of padding all round. */
const TABS_HEIGHT = 48;

/**
 * One tile's height, from the text styles' own line heights (so a Hindi or Marathi tile is as tall as it needs to be): the picture,
 * two lines of name, and the foot, with the tile's padding and border. Every tile has it, so the grid is level whatever the names
 * and prices are, and the loading skeleton uses it too.
 */
function useEssentialTileHeight(): number {
  const { locale } = useLanguage();
  const script = locale === 'en' ? 'latin' : 'devanagari';
  const name = Math.round(fontSize.sm * leading[script].tight) * 2;
  return BORDER * 2 + PADDING * 2 + PICTURE + GAP + name + GAP + FOOT;
}

/** How many tile rows `count` tiles take, two to a row. */
const rowsOf = (count: number): number => Math.ceil(count / 2);
const gridHeight = (count: number, tile: number): number =>
  rowsOf(count) * tile + Math.max(0, rowsOf(count) - 1) * GAP;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    // The tabs, the tiles and the bar sit on a soft aubergine block, so the module is set apart from the rows around it.
    inset: {
      backgroundColor: c.lilac,
      borderRadius: radius.xl,
      padding: space[3],
      gap: space[3],
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
    // Two to a row: half the width less half the gap.
    cell: { width: '48.6%', flexGrow: 1 },
    tile: {
      borderWidth: BORDER,
      borderColor: 'transparent',
      borderRadius: radius.lg,
      backgroundColor: c.surface,
      padding: PADDING,
      gap: GAP,
      flex: 1,
      justifyContent: 'space-between',
    },
    tileOn: { borderColor: c.action },
    // A tile that is already in the cart: a soft green wash, the stepper where the pack was.
    tileInCart: { backgroundColor: c.accentSubtle },
    picture: {
      height: PICTURE,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    check: {
      position: 'absolute',
      top: space[1],
      left: space[1],
      width: CHECK,
      height: CHECK,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: c.action,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: c.action },
    inCartMark: {
      position: 'absolute',
      top: space[1],
      left: space[1],
      width: CHECK,
      height: CHECK,
      borderRadius: radius.full,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    diet: { position: 'absolute', top: space[1], right: space[1] },
    name: { minHeight: 0 },
    foot: { height: FOOT, flexDirection: 'row', alignItems: 'center', gap: space[1] },
    footWords: { flex: 1, minWidth: 0 },
    footControl: { flexShrink: 0 },
    tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footer: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    main: { flex: 1 },
  });

/**
 * One daily essential as a tile. Not in the cart: a tickable tile with a box over its picture, the name (up to two lines), the
 * price over its pack and, when stock is short, "3 left"; a tap anywhere ticks it and the bar under the grid adds what is ticked.
 * Already in the cart: a green-washed tile with a tick, the name, the price and the usual compact stepper, so it can be changed or
 * taken out right here (at 1, minus takes it out and the tile is tickable again). A press and hold, or a tap on a tile in the
 * cart, opens the product.
 */
const EssentialTile = memo(function EssentialTile({
  item,
  ticked,
  onToggle,
}: {
  item: HomeItem;
  ticked: boolean;
  onToggle: (id: string) => void;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const tintOf = useTintOf();
  const inCart = useQuantity(item.defaultPackId);
  const mrp = item.mrp !== undefined && item.mrp > item.price ? item.mrp : undefined;
  const left = essentialLeft(item);
  const open = () => {
    router.push({ pathname: '/product/[id]', params: { id: item.id } });
  };
  const picture = (
    <View style={[styles.picture, { backgroundColor: tintOf(item.category) }]}>
      <NativeText
        allowFontScaling={false}
        aria-hidden
        style={{ fontSize: 36, lineHeight: 44, textAlign: 'center' }}
      >
        {item.emoji}
      </NativeText>
      <View style={styles.diet} pointerEvents="none">
        <DietMark kind={item.diet.kind} label={item.diet.label} size={12} />
      </View>
    </View>
  );

  if (inCart > 0) {
    return (
      <View style={[styles.tile, styles.tileInCart]}>
        <Pressable
          role="button"
          aria-label={[
            item.fullName,
            item.pack,
            formatRupees(item.price),
            t('home.essentials.inCart', { count: inCart }),
          ].join('. ')}
          onPress={open}
          style={({ pressed }) => [{ gap: GAP }, pressed && { opacity: 0.85 }]}
        >
          {picture}
          <View style={styles.inCartMark} aria-hidden>
            <NativeText
              allowFontScaling={false}
              style={{ fontSize: 16, lineHeight: 18, fontWeight: '700', color: colors.onAccent }}
            >
              {'✓'}
            </NativeText>
          </View>
          <Text variant="strong" tight numberOfLines={2}>
            {item.fullName}
          </Text>
        </Pressable>
        <View style={styles.foot}>
          <View style={styles.footWords}>
            <Text variant="strong" tight numberOfLines={1}>
              {formatRupees(item.price)}
            </Text>
          </View>
          <View style={styles.footControl}>
            <ItemControl item={item} compact />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      role="checkbox"
      aria-checked={ticked}
      aria-label={[
        item.fullName,
        item.pack,
        formatRupees(item.price) + (mrp !== undefined ? `, was ${formatRupees(mrp)}` : ''),
        left !== undefined ? item.stock?.label : undefined,
      ]
        .filter((part) => part !== undefined)
        .join('. ')}
      onPress={() => {
        onToggle(item.id);
      }}
      onLongPress={open}
      style={({ pressed }) => [styles.tile, ticked && styles.tileOn, pressed && { opacity: 0.85 }]}
    >
      {picture}
      <View style={[styles.check, ticked && styles.checkOn]} aria-hidden>
        {ticked ? (
          <NativeText
            allowFontScaling={false}
            style={{ fontSize: 16, lineHeight: 18, fontWeight: '700', color: colors.onAction }}
          >
            {'✓'}
          </NativeText>
        ) : null}
      </View>
      <Text variant="strong" tight numberOfLines={2}>
        {item.fullName}
      </Text>
      <View style={styles.foot}>
        <View style={styles.footWords}>
          <Text variant="strong" tight numberOfLines={1}>
            {formatRupees(item.price)}
          </Text>
          <Text
            variant="fine"
            tight
            color={left !== undefined ? 'warning' : 'inkMuted'}
            numberOfLines={1}
          >
            {left !== undefined ? t('home.essentials.left', { count: left }) : item.pack}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

/**
 * "Daily essentials" on Home (ADR 0048, ADR 0055 step 6): the things the town buys every day, to add without searching. A lettered
 * title, one segmented control (Morning, Cooking, Evening) over a grid of up to six tickable tiles, two to a row, and under it a
 * bar: "Select all" and "Add 3 items · ₹112". A shopper ticks the usual and adds the basket once. It opens on the tab that suits
 * the time of day; changing tab clears the ticks. Items that are not stocked or are out of stock are left out, a tab with nothing is
 * left out, and with no tab left the section is not shown. A press and hold on a tile opens the product.
 */
export function DailyEssentials() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const live = liveEssentialTabs(items);
  const cart = useCart();
  const { setQuantity } = useCartActions();
  const [picked, setPicked] = useState<EssentialTabId | undefined>(undefined);
  const [ticked, setTicked] = useState<ReadonlySet<string>>(() => new Set());
  const tileHeight = useEssentialTileHeight();

  if (live.length === 0) return null;

  const current =
    live.find((entry) => entry.tab.id === picked) ?? openingTab(live, new Date().getHours());
  if (current === undefined) return null;
  const most = Math.max(...live.map((entry) => entry.items.length));
  // Only what is not in the cart can be ticked: what is in it has its stepper.
  const selectable = current.items.filter(
    (item) => (cart.quantities[item.defaultPackId] ?? 0) === 0,
  );
  const basket = essentialBasket(selectable, ticked);
  const all = selectable.length > 0 && basket.count === selectable.length;

  const toggle = (id: string) => {
    setTicked((before) => {
      const next = new Set(before);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const addTicked = () => {
    for (const item of selectable) {
      if (!ticked.has(item.id)) continue;
      const rule = item.loose === true ? WEIGHT_RULE : countRule(item.maxQuantity);
      const before = cart.quantities[item.defaultPackId] ?? 0;
      setQuantity(item.defaultPackId, stepQuantity(before, 1, rule));
    }
    setTicked(new Set());
  };

  const label =
    basket.count === 0
      ? t('home.essentials.tick')
      : basket.count === 1
        ? t('home.essentials.addOne', { amount: formatRupees(money(basket.paise)) })
        : t('home.essentials.addMany', {
            count: basket.count,
            amount: formatRupees(money(basket.paise)),
          });

  return (
    <View style={styles.section} aria-label={t('home.essentials.title')}>
      <LetteredTitle
        word={t('home.essentials.word')}
        sticker={t('home.essentials.sticker')}
        sub={t('home.essentials.sub')}
      />
      <View style={styles.pad}>
        <View style={styles.inset}>
          <SegmentedTabs
            label={t('home.essentials.title')}
            options={live.map((entry) => ({ key: entry.tab.id, label: t(entry.tab.label) }))}
            selected={current.tab.id}
            onSelect={(key) => {
              setPicked(live.find((entry) => entry.tab.id === key)?.tab.id);
              setTicked(new Set());
            }}
          />
          {/* As tall as the fullest tab, so choosing a tab does not move what is under it. */}
          <View style={{ minHeight: gridHeight(most, tileHeight) }} role="group">
            <View style={styles.grid}>
              {current.items.map((item) => (
                <View key={item.id} style={[styles.cell, { height: tileHeight }]}>
                  <EssentialTile item={item} ticked={ticked.has(item.id)} onToggle={toggle} />
                </View>
              ))}
            </View>
          </View>
          {selectable.length > 0 ? (
            <View style={styles.footer}>
              <Button
                label={all ? t('home.essentials.clearAll') : t('home.essentials.selectAll')}
                variant="secondary"
                onPress={() => {
                  setTicked(all ? new Set() : new Set(selectable.map((item) => item.id)));
                }}
              />
              <View style={styles.main}>
                <Button
                  label={label}
                  disabled={basket.count === 0}
                  shine={basket.count > 0}
                  shineKey={String(basket.count)}
                  onPress={addTicked}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * The module's loading shape: the lettered title's place, the lilac block with the control, a grid as tall as the opening tab's
 * tiles will be (each tile the height of the real one), and the bar under it.
 */
export function DailyEssentialsSkeleton() {
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const live = liveEssentialTabs(items);
  const tileHeight = useEssentialTileHeight();
  const opening = openingTab(live, new Date().getHours());

  if (opening === undefined) return null;
  const most = Math.max(...live.map((entry) => entry.items.length));
  const shown = opening.items.length;

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <Skeleton width={220} height={36} rounded={radius.md} />
      </View>
      <View style={styles.pad}>
        <View style={styles.inset}>
          <Skeleton height={TABS_HEIGHT} rounded={radius.md} />
          <View style={{ minHeight: gridHeight(most, tileHeight) }}>
            <View style={styles.grid}>
              {Array.from({ length: shown }, (_, tile) => (
                <View key={tile} style={styles.cell}>
                  <Skeleton height={tileHeight} rounded={radius.lg} />
                </View>
              ))}
            </View>
          </View>
          <Skeleton height={TAP_MIN} rounded={radius.md} />
        </View>
      </View>
    </View>
  );
}
