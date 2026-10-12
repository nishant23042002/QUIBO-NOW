import type { Money } from '@quibo/contracts';
import { memo, type ReactNode } from 'react';
import { Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { DietMark } from './DietMark';
import { DiscountRibbon } from './DiscountRibbon';
import { Icon } from './Icon';
import { PriceBadge } from './PriceBadge';
import { Text } from './Text';
import { fontSize, leading, radius, space } from './tokens';

export interface ProductCardProps {
  name: string;
  /** Pack size, already worded, for example "500 ml". */
  pack: string;
  price: Money;
  /** The printed price. When it is higher than `price` it shows struck through. */
  mrp?: Money;
  /** The ribbon on the picture: what is saved, in rupees, for example "₹6", and the word "OFF". Leave out when there is no saving. */
  ribbon?: { amount: string; offLabel: string };
  /** For items that can come in the next delivery window: the line under the pack, for example "15–20 mins". Only some items have one. */
  quickLabel?: string;
  /** Draws the pack line in the accent colour: a price per unit that is lower than the one being compared with. */
  packAccent?: boolean;
  /** Vegetarian or not, with the words a screen reader says for it. Packaged food always has one. */
  diet?: { kind: 'veg' | 'nonveg'; label: string };
  /**
   * When stock is short. "out": the item cannot be added, and says so on its picture. "low": a warning line
   * under the pack, for example "Only 3 left", in place of the delivery line.
   */
  stock?: { kind: 'out' | 'low'; label: string };
  /** One emoji standing in for the photo until real photos exist. */
  emoji: string;
  /** The colour behind the picture. */
  tint: string;
  /** The card's width. The picture is a square of the same size. */
  width: number;
  /**
   * Keep room under the pack for the delivery or low-stock line. A compact card has no such room unless asked, so cards stay short;
   * a row that holds a card with the line passes true for all of them, so its cards stay the same height. Wide cards always keep it.
   */
  reserveNote?: boolean;
  /**
   * The ADD button that turns into the stepper, in the picture's lower corner. It is a slot, built and kept up to date by whoever
   * holds the cart, so a change to the count redraws only this control and never the card.
   */
  control: ReactNode;
  /** Tapping the picture or the text opens the item's detail. ADD and the stepper do not. */
  onPress?: () => void;
}

const NAME_LINES = 2;
/** Cards narrower than this are compact: smaller text (never under 14) and a shorter picture, so a narrow card is not a tall one. */
const COMPACT_UNDER = 150;

/** Whether a card of this width is the compact kind. */
export function isCompactCard(width: number): boolean {
  return width < COMPACT_UNDER;
}

export interface ProductCardMetrics {
  compact: boolean;
  /** One small line of text: the pack, or the low-stock line. */
  line: number;
  /** One line of the name. */
  nameLine: number;
  /** The price badge's row. */
  priceHeight: number;
  /** The whole text block under the picture. */
  textHeight: number;
}

/**
 * The measurements of a card's text block, shared with the loading skeleton so the two always line up. A compact card (under 150
 * wide) sets its name and pack at 14, the smallest size the app uses, with the name's lines packed close, and keeps room only for the
 * price, a two-line name and the pack (and one more line when its row has a delivery or low-stock note), so it does not grow tall. A wide card keeps the roomier 16 and room for a low-stock line.
 * Without a width, the wide measurements.
 */
export function useProductCardMetrics(width?: number, reserveNote?: boolean): ProductCardMetrics {
  const { locale } = useLanguage();
  const script = locale === 'en' ? 'latin' : 'devanagari';
  const compact = width !== undefined && isCompactCard(width);
  // The name is what tells a shopper which item it is, so it keeps the full 16 even on a compact card (its lines packed close);
  // only the pack and the low-stock line step down to 14.
  const line = Math.round(
    (compact ? fontSize.xs : fontSize.sm) * leading[script][compact ? 'tight' : 'normal'],
  );
  const nameLine = Math.round(fontSize.sm * leading[script][compact ? 'tight' : 'normal']);
  const priceHeight =
    Math.round((compact ? fontSize.sm : fontSize.base) * leading[script].normal) +
    (compact ? 6 : 8);
  const note = reserveNote ?? !compact;
  // The price, the name, the pack, and the low-stock line when there is room for it, with a small gap between each.
  const rows = 3 + (note ? 1 : 0);
  const textHeight =
    priceHeight + nameLine * NAME_LINES + line * (note ? 2 : 1) + space[1] * (rows - 1);
  return { compact, line, nameLine, priceHeight, textHeight };
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: { gap: space[2] },
    picture: {
      overflow: 'hidden',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
    },
    // Under the controls, filling the picture: the part that opens the detail.
    open: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // The ADD button sits on the picture's lower right corner, and turns into the stepper there.
    control: { position: 'absolute', right: space[2], bottom: space[2] },
    controlCompact: { position: 'absolute', right: space[1] + 2, bottom: space[1] + 2 },
    // The ribbon hangs from the top edge, a little in from the left.
    ribbon: { position: 'absolute', top: 0, left: space[2] },
    ribbonCompact: { position: 'absolute', top: 0, left: space[1] + 2 },
    // The "out of stock" label sits across the lower part of the picture, where ADD would have been.
    unavailable: {
      position: 'absolute',
      left: space[2],
      right: space[2],
      bottom: space[2],
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    text: { gap: space[1], paddingHorizontal: space[1] },
    name: { minWidth: 0 },
    // The vegetarian mark sits on the picture's upper right corner, with nothing behind it, which leaves the whole width under the
    // picture to the name.
    diet: { position: 'absolute', top: space[1] + 2, right: space[1] + 2 },
    line: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  });

/**
 * One item in a row or a grid: a picture on the category's tint with an aubergine ribbon for the saving
 * hanging from its top edge, ADD turning into a stepper in its lower corner (or "out of stock" in its place),
 * then the price badge, the name (up to two lines), the pack size and, when stock is short, a warning. The vegetarian mark sits on the
 * picture's upper right corner.
 * The picture is a square, and a narrow card sets its pack and notes at 14, so cards stay short for their width.
 */
export const ProductCard = memo(function ProductCard({
  name,
  pack,
  price,
  mrp,
  ribbon,
  quickLabel,
  packAccent = false,
  diet,
  stock,
  emoji,
  tint,
  width,
  reserveNote,
  control,
  onPress,
}: ProductCardProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { compact, textHeight } = useProductCardMetrics(width, reserveNote);
  const out = stock?.kind === 'out';
  // A square picture, the width of the card.
  const pictureHeight = width;

  return (
    <View style={[styles.card, { width }]}>
      <View style={[styles.picture, { backgroundColor: tint, height: pictureHeight }]}>
        <Pressable
          accessible={false}
          onPress={onPress}
          // The picture rests a little above its middle, clear of the ADD button in the lower corner.
          style={[styles.open, { paddingBottom: Math.round(pictureHeight * 0.2) }]}
        >
          <NativeText
            allowFontScaling={false}
            style={{
              fontSize: Math.round(pictureHeight * 0.46),
              lineHeight: Math.round(pictureHeight * 0.56),
              textAlign: 'center',
              opacity: out ? 0.35 : 1,
            }}
            aria-hidden
          >
            {emoji}
          </NativeText>
          {ribbon !== undefined && !out ? (
            <View style={compact ? styles.ribbonCompact : styles.ribbon}>
              <DiscountRibbon amount={ribbon.amount} offLabel={ribbon.offLabel} compact={compact} />
            </View>
          ) : null}
        </Pressable>
        {out ? (
          <View style={styles.unavailable} accessible aria-label={stock.label}>
            <Text variant={compact ? 'caption' : 'strong'} color="inkMuted" numberOfLines={1}>
              {stock.label}
            </Text>
          </View>
        ) : (
          <View style={compact ? styles.controlCompact : styles.control}>{control}</View>
        )}
        {diet !== undefined ? (
          <View style={styles.diet} pointerEvents="none">
            <DietMark kind={diet.kind} label={diet.label} size={14} />
          </View>
        ) : null}
      </View>
      <Pressable
        accessible
        role="button"
        aria-label={`${name}. ${pack}`}
        onPress={onPress}
        style={[styles.text, { minHeight: textHeight, opacity: out ? 0.6 : 1 }]}
      >
        <PriceBadge amount={price} compact={compact} {...(mrp !== undefined ? { mrp } : {})} />
        <View style={styles.name}>
          <Text variant="strong" tight={compact} numberOfLines={NAME_LINES}>
            {name}
          </Text>
        </View>
        <Text
          variant={compact ? 'fine' : 'small'}
          tight={compact}
          color={packAccent ? 'accentInk' : 'inkMuted'}
          numberOfLines={1}
        >
          {pack}
        </Text>
        {stock?.kind === 'low' ? (
          <Text variant={compact ? 'caption' : 'strong'} color="warning" numberOfLines={1}>
            {stock.label}
          </Text>
        ) : quickLabel !== undefined && !out ? (
          <View style={styles.line} accessible aria-label={quickLabel}>
            <Icon name="clock" color={colors.accentInk} size={14} />
            <Text variant={compact ? 'caption' : 'strong'} color="accentInk" numberOfLines={1}>
              {quickLabel}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
});
