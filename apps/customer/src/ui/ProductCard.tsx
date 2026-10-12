import type { Money } from '@quibo/contracts';
import { Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { DietMark } from './DietMark';
import { DiscountRibbon } from './DiscountRibbon';
import { PriceBadge } from './PriceBadge';
import { Stepper, type StepperProps } from './Stepper';
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
  /** Vegetarian or not, with the words a screen reader says for it. Packaged food always has one. */
  diet?: { kind: 'veg' | 'nonveg'; label: string };
  /**
   * When stock is short. "out": the item cannot be added, and says so on its picture. "low": a warning line
   * under the pack, for example "Only 3 left".
   */
  stock?: { kind: 'out' | 'low'; label: string };
  /** One emoji standing in for the photo until real photos exist. */
  emoji: string;
  /** The colour behind the picture. */
  tint: string;
  /** The card's width. The picture is a little wider than tall, so the card is not stretched. */
  width: number;
  /**
   * Keep room under the pack for the low-stock line. A compact card has no such room unless asked, so cards stay short; a row that
   * holds a card with the line passes true for all of them, so its cards stay the same height. Wide cards always keep the room.
   */
  reserveNote?: boolean;
  quantity: number;
  onQuantityChange: (next: number) => void;
  /** Tapping the picture or the text opens the item's detail. ADD and the stepper do not. */
  onPress?: () => void;
  stepper: Pick<
    StepperProps,
    | 'addLabel'
    | 'addAriaLabel'
    | 'decreaseLabel'
    | 'increaseLabel'
    | 'maxLabel'
    | 'rule'
    | 'unitLabel'
  >;
}

const NAME_LINES = 2;
/** Cards narrower than this are compact: smaller text (never under 14) and a shorter picture, so a narrow card is not a tall one. */
const COMPACT_UNDER = 150;
const COMPACT_PICTURE = 1.2;
const WIDE_PICTURE = 1.1;

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
  /** The picture's width over its height. */
  pictureRatio: number;
}

/**
 * The measurements of a card's text block, shared with the loading skeleton so the two always line up. A compact card (under 150
 * wide) sets its name and pack at 14, the smallest size the app uses, with the name's lines packed close, and keeps room only for the
 * price, a two-line name and the pack, so it does not grow tall. A wide card keeps the roomier 16 and room for a low-stock line.
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
  return {
    compact,
    line,
    nameLine,
    priceHeight,
    textHeight,
    pictureRatio: compact ? COMPACT_PICTURE : WIDE_PICTURE,
  };
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: { gap: space[2] },
    picture: {
      overflow: 'hidden',
      borderRadius: radius.lg,
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
    nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[1] },
    mark: { paddingTop: 3 },
    name: { flex: 1, minWidth: 0 },
  });

/**
 * One item in a row or a grid: a picture on the category's tint with an aubergine ribbon for the saving
 * hanging from its top edge, ADD turning into a stepper in its lower corner (or "out of stock" in its place),
 * then the price badge, the vegetarian mark with the name (up to two lines), the pack size and, when stock is short, a warning.
 * The picture is a little wider than tall, and a narrow card sets its text at 14, so cards are short for their width.
 */
export function ProductCard({
  name,
  pack,
  price,
  mrp,
  ribbon,
  diet,
  stock,
  emoji,
  tint,
  width,
  reserveNote,
  quantity,
  onQuantityChange,
  onPress,
  stepper,
}: ProductCardProps) {
  const styles = useStyles(makeStyles);
  const { compact, textHeight, pictureRatio } = useProductCardMetrics(width, reserveNote);
  const out = stock?.kind === 'out';
  const pictureHeight = Math.round(width / pictureRatio);

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
          <View style={compact ? styles.controlCompact : styles.control}>
            <Stepper value={quantity} onChange={onQuantityChange} compact={compact} {...stepper} />
          </View>
        )}
      </View>
      <Pressable
        accessible
        role="button"
        aria-label={`${name}. ${pack}`}
        onPress={onPress}
        style={[styles.text, { minHeight: textHeight, opacity: out ? 0.6 : 1 }]}
      >
        <PriceBadge amount={price} compact={compact} {...(mrp !== undefined ? { mrp } : {})} />
        <View style={styles.nameRow}>
          {diet !== undefined ? (
            <View style={styles.mark}>
              <DietMark kind={diet.kind} label={diet.label} size={14} />
            </View>
          ) : null}
          <View style={styles.name}>
            <Text variant="strong" tight={compact} numberOfLines={NAME_LINES}>
              {name}
            </Text>
          </View>
        </View>
        <Text
          variant={compact ? 'fine' : 'small'}
          tight={compact}
          color="inkMuted"
          numberOfLines={1}
        >
          {pack}
        </Text>
        {stock?.kind === 'low' ? (
          <Text variant={compact ? 'caption' : 'strong'} color="warning" numberOfLines={1}>
            {stock.label}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}
