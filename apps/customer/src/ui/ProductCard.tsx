import type { Money } from '@quibo/contracts';
import { Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { DietMark } from './DietMark';
import { DiscountRibbon } from './DiscountRibbon';
import { Icon } from './Icon';
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
  /** For items that can come in the next delivery window: the line under the pack, for example "Today 4–6 PM". Only some items have one. */
  quickLabel?: string;
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
  quantity: number;
  onQuantityChange: (next: number) => void;
  /** Tapping the picture or the text opens the item's detail. ADD and the stepper do not. */
  onPress?: () => void;
  stepper: Pick<StepperProps, 'addLabel' | 'decreaseLabel' | 'increaseLabel' | 'maxLabel' | 'rule'>;
}

const NAME_LINES = 2;

/**
 * The measurements of a card's text block, shared with the loading skeleton so the two always line up: the height
 * of one small line, of the price badge's row, and of the whole block. The block keeps room for the price badge,
 * a two-line name, the pack and the last line, so every card is the same height and each line sits straight under
 * the one before, whatever the name's length.
 */
export function useProductCardMetrics(): {
  line: number;
  priceHeight: number;
  textHeight: number;
} {
  const { locale } = useLanguage();
  const rhythm = leading[locale === 'en' ? 'latin' : 'devanagari'].normal;
  const line = Math.round(fontSize.sm * rhythm);
  const priceHeight = Math.round(fontSize.base * rhythm) + 8;
  return { line, priceHeight, textHeight: priceHeight + line * (NAME_LINES + 2) + space[1] * 3 };
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: { gap: space[2] },
    picture: {
      aspectRatio: 1,
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
    // The ribbon hangs from the top edge, a little in from the left.
    ribbon: { position: 'absolute', top: 0, left: space[2] },
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
    mark: { paddingTop: 4 },
    name: { flex: 1, minWidth: 0 },
    line: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  });

/**
 * One item in a row or a grid: a picture on the category's tint with an aubergine ribbon for the saving
 * hanging from its top edge, ADD turning into a stepper in its lower corner (or "out of stock" in its place),
 * then the price badge, the vegetarian mark with the name (up to two lines), the pack size and one line
 * more: a low-stock warning, or when the item can come in the next window. The text block keeps room for
 * all of it, so every card is the same height.
 */
export function ProductCard({
  name,
  pack,
  price,
  mrp,
  ribbon,
  quickLabel,
  diet,
  stock,
  emoji,
  tint,
  width,
  quantity,
  onQuantityChange,
  onPress,
  stepper,
}: ProductCardProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { textHeight } = useProductCardMetrics();
  const out = stock?.kind === 'out';

  return (
    <View style={[styles.card, { width }]}>
      <View style={[styles.picture, { backgroundColor: tint }]}>
        <Pressable accessible={false} onPress={onPress} style={styles.open}>
          <NativeText
            allowFontScaling={false}
            style={{
              fontSize: width * 0.42,
              lineHeight: width * 0.52,
              textAlign: 'center',
              opacity: out ? 0.35 : 1,
            }}
            aria-hidden
          >
            {emoji}
          </NativeText>
          {ribbon !== undefined && !out ? (
            <View style={styles.ribbon}>
              <DiscountRibbon amount={ribbon.amount} offLabel={ribbon.offLabel} />
            </View>
          ) : null}
        </Pressable>
        {out ? (
          <View style={styles.unavailable} accessible aria-label={stock.label}>
            <Text variant="strong" color="inkMuted" numberOfLines={1}>
              {stock.label}
            </Text>
          </View>
        ) : (
          <View style={styles.control}>
            <Stepper value={quantity} onChange={onQuantityChange} {...stepper} />
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
        <PriceBadge amount={price} {...(mrp !== undefined ? { mrp } : {})} />
        <View style={styles.nameRow}>
          {diet !== undefined ? (
            <View style={styles.mark}>
              <DietMark kind={diet.kind} label={diet.label} size={14} />
            </View>
          ) : null}
          <View style={styles.name}>
            <Text variant="strong" numberOfLines={NAME_LINES}>
              {name}
            </Text>
          </View>
        </View>
        <Text variant="small" color="inkMuted" numberOfLines={1}>
          {pack}
        </Text>
        {stock?.kind === 'low' ? (
          <Text variant="strong" color="warning" numberOfLines={1}>
            {stock.label}
          </Text>
        ) : quickLabel !== undefined && !out ? (
          <View style={styles.line} accessible aria-label={quickLabel}>
            <Icon name="clock" color={colors.accentInk} size={14} />
            <Text variant="strong" color="accentInk" numberOfLines={1}>
              {quickLabel}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
