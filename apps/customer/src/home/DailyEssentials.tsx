import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  Button,
  DietMark,
  RowTitle,
  RowTitleSkeleton,
  SegmentedTabs,
  Skeleton,
  SkeletonLine,
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

/** The picture square in a row. */
const PICTURE = 44;
const CHECK = 24;
const PADDING = space[2];
/** The hairline between rows, and round the card. */
const HAIRLINE = 1;
/** The segmented control's height: a 40 dp option in a track with 4 of padding all round. */
const TABS_HEIGHT = 48;

/**
 * One row's height, from the text styles' own line heights (so a Hindi or Marathi row is as tall as it needs to be): the picture or
 * the price over its struck MRP, whichever is taller, with the row's padding, and never less than a thumb needs. Every row has it,
 * so the list is level whatever the names and prices are, and the loading skeleton uses it too.
 */
function useEssentialRowHeight(): number {
  const { locale } = useLanguage();
  const script = locale === 'en' ? 'latin' : 'devanagari';
  const price = Math.round(fontSize.sm * leading[script].tight);
  const mrp = Math.round(fontSize.xs * leading[script].tight);
  return PADDING * 2 + Math.max(PICTURE, price + mrp, TAP_MIN - PADDING * 2 + 4);
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    // One card holds the whole list, rows divided by a hairline.
    card: {
      borderRadius: radius.md,
      borderWidth: HAIRLINE,
      borderColor: c.line,
      backgroundColor: c.surface,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[3],
    },
    ticked: { backgroundColor: c.lilac },
    divided: { borderTopWidth: HAIRLINE, borderTopColor: c.line },
    box: {
      width: CHECK,
      height: CHECK,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: c.action,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxOn: { backgroundColor: c.action },
    picture: {
      width: PICTURE,
      height: PICTURE,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    diet: { position: 'absolute', top: 2, right: 2 },
    // A row that is already in the cart: a soft green wash, a pistachio tick where the box was, and the stepper where the price was.
    inCartRow: { backgroundColor: c.accentSubtle },
    openArea: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space[3] },
    inCartMark: {
      width: CHECK,
      height: CHECK,
      borderRadius: radius.full,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priceInline: { flexDirection: 'row', alignItems: 'center', gap: space[1], minWidth: 0 },
    words: { flex: 1, minWidth: 0 },
    packLine: { flexDirection: 'row', alignItems: 'center', gap: space[1], minWidth: 0 },
    pack: { flexShrink: 1, minWidth: 0 },
    price: { alignItems: 'flex-end' },
    footer: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    main: { flex: 1 },
  });

/**
 * One daily essential. Not in the cart: a tickable row with a box, a picture, the name on one line (cut with an ellipsis when long)
 * over the pack and, when stock is short, "3 left", and at the end the price over its struck MRP; a tap anywhere ticks it and the
 * bar under the list adds what is ticked. Already in the cart: a green-washed row with a tick, the picture, the name over the price
 * and pack, and the usual stepper at the end, so it can be changed or taken out right here (at 1, minus takes it out and the row is
 * tickable again). A tap on the words opens the product.
 */
const EssentialRow = memo(function EssentialRow({
  item,
  ticked,
  divided,
  height,
  onToggle,
}: {
  item: HomeItem;
  ticked: boolean;
  divided: boolean;
  height: number;
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

  if (inCart > 0) {
    return (
      <View style={[styles.row, styles.inCartRow, divided && styles.divided, { height }]}>
        <Pressable
          role="button"
          aria-label={[
            item.fullName,
            item.pack,
            formatRupees(item.price),
            t('home.essentials.inCart', { count: inCart }),
          ].join('. ')}
          onPress={open}
          style={({ pressed }) => [styles.openArea, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.inCartMark} aria-hidden>
            <NativeText
              allowFontScaling={false}
              style={{ fontSize: 16, lineHeight: 18, fontWeight: '700', color: colors.onAccent }}
            >
              {'✓'}
            </NativeText>
          </View>
          <View style={[styles.picture, { backgroundColor: tintOf(item.category) }]}>
            <NativeText
              allowFontScaling={false}
              aria-hidden
              style={{ fontSize: 26, lineHeight: 32, textAlign: 'center' }}
            >
              {item.emoji}
            </NativeText>
            <View style={styles.diet} pointerEvents="none">
              <DietMark kind={item.diet.kind} label={item.diet.label} size={12} />
            </View>
          </View>
          <View style={styles.words}>
            <Text variant="strong" tight numberOfLines={1}>
              {item.fullName}
            </Text>
            <View style={styles.priceInline}>
              <Text variant="strong" tight numberOfLines={1}>
                {formatRupees(item.price)}
              </Text>
              <View style={styles.pack}>
                <Text variant="fine" tight color="inkMuted" numberOfLines={1}>
                  {`· ${item.pack}`}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
        <ItemControl item={item} compact />
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
      style={({ pressed }) => [
        styles.row,
        divided && styles.divided,
        ticked && styles.ticked,
        pressed && { opacity: 0.85 },
        { height },
      ]}
    >
      <View style={[styles.box, ticked && styles.boxOn]} aria-hidden>
        {ticked ? (
          <NativeText
            allowFontScaling={false}
            style={{ fontSize: 16, lineHeight: 18, fontWeight: '700', color: colors.onAction }}
          >
            {'✓'}
          </NativeText>
        ) : null}
      </View>
      <View style={[styles.picture, { backgroundColor: tintOf(item.category) }]}>
        <NativeText
          allowFontScaling={false}
          aria-hidden
          style={{ fontSize: 26, lineHeight: 32, textAlign: 'center' }}
        >
          {item.emoji}
        </NativeText>
        <View style={styles.diet} pointerEvents="none">
          <DietMark kind={item.diet.kind} label={item.diet.label} size={12} />
        </View>
      </View>
      <View style={styles.words}>
        <Text variant="strong" tight numberOfLines={1}>
          {item.fullName}
        </Text>
        <View style={styles.packLine}>
          <View style={styles.pack}>
            <Text variant="fine" tight color="inkMuted" numberOfLines={1}>
              {item.pack}
            </Text>
          </View>
          {left !== undefined ? (
            <Text variant="caption" tight color="warning" numberOfLines={1}>
              {`· ${t('home.essentials.left', { count: left })}`}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.price}>
        <Text variant="strong" tight numberOfLines={1}>
          {formatRupees(item.price)}
        </Text>
        {mrp !== undefined ? (
          <Text variant="fine" tight color="inkMuted" strike numberOfLines={1}>
            {formatRupees(mrp)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});

/**
 * "Daily essentials" on Home (ADR 0048): the things the town buys every day, to add without searching. One segmented control
 * (Morning, Cooking, Evening) over one card of up to six tickable rows, and under it a bar: "Select all" and "Add 3 items · ₹112".
 * A shopper ticks the usual and adds the basket once. It opens on the tab that suits the time of day; changing tab clears the
 * ticks. Items that are not stocked or are out of stock are left out, a tab with nothing is left out, and with no tab left the
 * section is not shown. A press and hold on a row opens the product.
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
  const rowHeight = useEssentialRowHeight();

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
            setTicked(new Set());
          }}
        />
      </View>
      {/* As tall as the fullest tab, so choosing a tab does not move what is under it. */}
      <View style={styles.pad}>
        <View
          style={[styles.card, { minHeight: most * rowHeight + (most - 1) * HAIRLINE + 2 }]}
          role="group"
        >
          {current.items.map((item, index) => (
            <EssentialRow
              key={item.id}
              item={item}
              ticked={ticked.has(item.id)}
              divided={index > 0}
              height={rowHeight}
              onToggle={toggle}
            />
          ))}
        </View>
      </View>
      {selectable.length > 0 ? (
        <View style={[styles.pad, styles.footer]}>
          <Button
            label={all ? t('home.essentials.clearAll') : t('home.essentials.selectAll')}
            variant="secondary"
            light
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
  );
}

/**
 * The strip's loading shape: the title, the control, a card as tall as the opening tab's list will be, each row the height of the
 * real one, and the bar under it.
 */
export function DailyEssentialsSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const live = liveEssentialTabs(items);
  const rowHeight = useEssentialRowHeight();
  const opening = openingTab(live, new Date().getHours());

  if (opening === undefined) return null;
  const most = Math.max(...live.map((entry) => entry.items.length));
  const shown = opening.items.length;

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitleSkeleton title={t('home.essentials.title')} />
      </View>
      <View style={styles.pad}>
        <Skeleton height={TABS_HEIGHT} rounded={radius.md} />
      </View>
      {/* The card as it will be: a box, a picture, a name over its pack and a price in each row, as tall as the fullest tab. */}
      <View style={styles.pad}>
        <View
          style={[styles.card, { minHeight: most * rowHeight + (most - 1) * HAIRLINE + 2 }]}
          aria-hidden
        >
          {Array.from({ length: shown }, (_, index) => (
            <View
              key={index}
              style={[styles.row, index > 0 && styles.divided, { height: rowHeight }]}
            >
              <Skeleton width={CHECK} height={CHECK} rounded={radius.sm} />
              <Skeleton width={PICTURE} height={PICTURE} rounded={radius.md} />
              <View style={styles.words}>
                <SkeletonLine size="sm" width={index % 2 === 0 ? '66%' : '52%'} />
                <SkeletonLine size="xs" width="30%" />
              </View>
              <Skeleton width={48} height={Math.round(fontSize.sm * 0.8)} />
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.pad, styles.footer]}>
        <Skeleton width={128} height={TAP_MIN} rounded={radius.md} />
        <View style={styles.main}>
          <Skeleton height={TAP_MIN} rounded={radius.md} />
        </View>
      </View>
    </View>
  );
}
