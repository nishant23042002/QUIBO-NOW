import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  DietMark,
  DiscountRibbon,
  Icon,
  Skeleton,
  Text,
  radius,
  space,
  useProductCardMetrics,
} from '@/ui';
import { useTintOf } from './categories';
import { useDeliveryWhen } from './deliveryInfo';
import type { HomeItem } from './items';
import { ItemControl } from './ItemTile';

/**
 * A card's width in the "Small prices" row: a little wider than the other rows' cards, so the price and the ADD pill share one line
 * with room for the stepper that ADD turns into, and still narrow enough for the next card to peek in.
 */
export const PRICE_TILE_WIDTH = 148;
/** The row the price and the control share. */
const PRICE_ROW = 44;
const NAME_LINES = 2;

/**
 * The text block's height, from the same measurements `ProductCard` uses for its name and pack lines (so a Hindi or Marathi card is
 * as tall as it needs to be), with the price row in place of the price badge. The loading skeleton uses it too.
 */
function usePriceTileMetrics(width: number, reserveNote?: boolean) {
  const { compact, line, nameLine } = useProductCardMetrics(width, reserveNote);
  const note = reserveNote ?? !compact;
  const rows = 3 + (note ? 1 : 0);
  const textHeight =
    PRICE_ROW + nameLine * NAME_LINES + line * (note ? 2 : 1) + space[1] * (rows - 1);
  return { compact, line, nameLine, textHeight };
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: { gap: space[2] },
    picture: { overflow: 'hidden', borderRadius: radius.lg },
    // The part of the picture that opens the item.
    open: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ribbon: { position: 'absolute', top: 0, left: space[2] },
    diet: { position: 'absolute', top: space[2], right: space[2] },
    unavailable: {
      position: 'absolute',
      left: space[2],
      right: space[2],
      bottom: space[2],
      minHeight: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.surface,
    },
    text: { gap: space[1] },
    // The price on the left, big and bold, and the ADD pill on the right: the point of this row is what a thing costs.
    priceRow: {
      minHeight: PRICE_ROW,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
    },
    price: { flexShrink: 1, minWidth: 0 },
    info: { gap: space[1] },
    line: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    pressed: { opacity: 0.85 },
  });

/**
 * One item in "Small prices" (ADR 0047): a tinted picture, then one row with the price large and bold on the left and a pistachio ADD
 * (turning into the stepper) on the right, then the name, the pack and, when it applies, a delivery or low-stock line. It keeps
 * everything `ItemTile` does (the cart wiring, the vegetarian mark, the saving ribbon, "out of stock" and the low-stock warning); only
 * the arrangement differs, because this is the one row where price is the point.
 */
export const PriceTile = memo(function PriceTile({
  item,
  width = PRICE_TILE_WIDTH,
  reserveNote,
}: {
  item: HomeItem;
  width?: number;
  /** Whether some card beside this one carries a delivery or low-stock line, so every card in the row keeps room for it. */
  reserveNote?: boolean;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const tintOf = useTintOf();
  const when = useDeliveryWhen();
  const { compact, textHeight } = usePriceTileMetrics(width, reserveNote);
  const out = item.stock?.kind === 'out';
  const pack = item.sizesLabel === undefined ? item.pack : `${item.pack} · ${item.sizesLabel}`;
  const open = () => {
    router.push({ pathname: '/product/[id]', params: { id: item.id } });
  };

  return (
    <View style={[styles.card, { width }]}>
      <View style={[styles.picture, { height: width, backgroundColor: tintOf(item.category) }]}>
        <Pressable accessible={false} onPress={open} style={styles.open}>
          <NativeText
            allowFontScaling={false}
            style={{
              fontSize: Math.round(width * 0.46),
              lineHeight: Math.round(width * 0.56),
              textAlign: 'center',
              opacity: out ? 0.35 : 1,
            }}
            aria-hidden
          >
            {item.emoji}
          </NativeText>
          {item.ribbon !== undefined && !out ? (
            <View style={styles.ribbon}>
              <DiscountRibbon
                amount={item.ribbon.amount}
                offLabel={item.ribbon.offLabel}
                compact={compact}
              />
            </View>
          ) : null}
        </Pressable>
        {item.diet !== undefined ? (
          <View style={styles.diet} pointerEvents="none">
            <DietMark kind={item.diet.kind} label={item.diet.label} size={14} />
          </View>
        ) : null}
        {out && item.stock !== undefined ? (
          <View style={styles.unavailable} accessible aria-label={item.stock.label}>
            <Text variant="caption" color="inkMuted" numberOfLines={1}>
              {item.stock.label}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.text, { minHeight: textHeight, opacity: out ? 0.6 : 1 }]}>
        <View style={styles.priceRow}>
          <Pressable
            accessible
            role="button"
            aria-label={`${item.fullName}, ${formatRupees(item.price)}`}
            onPress={open}
            style={({ pressed }) => [styles.price, pressed && styles.pressed]}
          >
            <Text variant="subheading" numberOfLines={1}>
              {formatRupees(item.price)}
            </Text>
            {item.mrp !== undefined && item.mrp > item.price ? (
              <Text variant="fine" tight color="inkMuted" strike numberOfLines={1}>
                {formatRupees(item.mrp)}
              </Text>
            ) : null}
          </Pressable>
          {out ? null : <ItemControl item={item} compact accent />}
        </View>
        <Pressable
          accessible
          role="button"
          aria-label={`${item.fullName}. ${pack}`}
          onPress={open}
          style={styles.info}
        >
          <Text variant="strong" tight numberOfLines={NAME_LINES}>
            {item.fullName}
          </Text>
          <Text variant="fine" tight color="inkMuted" numberOfLines={1}>
            {pack}
          </Text>
          {item.stock?.kind === 'low' ? (
            <Text variant="caption" color="warning" numberOfLines={1}>
              {item.stock.label}
            </Text>
          ) : item.quick === true && !out ? (
            <View style={styles.line} accessible aria-label={when.short}>
              <Icon name="clock" color={colors.accentInk} size={14} />
              <Text variant="caption" color="accentInk" numberOfLines={1}>
                {when.short}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
});

/** The card in grey, the height of the real one: the picture, the price row, two lines of name, the pack and the note. */
export function PriceTileSkeleton({
  width = PRICE_TILE_WIDTH,
  reserveNote,
}: {
  width?: number;
  reserveNote?: boolean;
}) {
  const { line, nameLine, textHeight } = usePriceTileMetrics(width, reserveNote);
  const bar = Math.round(nameLine * 0.6);
  const note = reserveNote ?? false;

  return (
    <View style={{ width, gap: space[2] }}>
      <Skeleton width={width} height={width} rounded={radius.lg} />
      <View style={{ minHeight: textHeight, gap: space[1] }}>
        <View
          style={{
            height: PRICE_ROW,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Skeleton width={52} height={22} />
          <Skeleton width={60} height={28} rounded={radius.md} />
        </View>
        <View>
          <View style={{ height: nameLine, justifyContent: 'center' }}>
            <Skeleton width="92%" height={bar} />
          </View>
          <View style={{ height: nameLine, justifyContent: 'center' }}>
            <Skeleton width="62%" height={bar} />
          </View>
        </View>
        <View style={{ height: line, justifyContent: 'center' }}>
          <Skeleton width="36%" height={Math.round(bar * 0.85)} />
        </View>
        {note ? (
          <View style={{ height: line, justifyContent: 'center' }}>
            <Skeleton width="50%" height={Math.round(bar * 0.85)} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
