import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface PackOption {
  id: string;
  /** For example "500 ml". */
  label: string;
  /** For example "₹29". */
  priceLabel: string;
  /** The printed price, for example "₹30", shown struck through beside the price when it is higher. */
  mrpLabel?: string;
  /** What buying this size saves, for example "Save ₹2". Leave out when the printed price is not above the price. */
  saveLabel?: string;
  /** For example "₹58/L". Leave out when the packs cannot be compared. */
  unitLabel?: string;
  /** For example "Best value". Leave out for the others. */
  tagLabel?: string;
  /** How many of this size are in the cart. Shown as a small cart badge when above 0. */
  inCart?: number;
  /** What a screen reader says for the badge, for example "2 in cart". */
  inCartLabel?: string;
  /** For example "Out of stock". When present the pack cannot be chosen. */
  unavailableLabel?: string;
}

export interface PackPickerProps {
  /** The heading above the options, for example "Pick a size". */
  title: string;
  options: readonly PackOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  /**
   * A tile after the options that cannot be chosen, for a product that comes in one size only, so the picker has the same shape on
   * every product. It says something meaningful, for example "Other sizes: Coming soon".
   */
  placeholder?: { title: string; body: string };
  /** How the tag on the best-value size is drawn: a solid pistachio pill (the default), or the soft green tint of the page's other pills. */
  tagTone?: 'solid' | 'soft';
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    group: { gap: space[2] },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    option: {
      minWidth: 104,
      flexGrow: 1,
      flexBasis: 104,
      gap: 2,
      paddingHorizontal: space[3],
      paddingTop: space[3],
      paddingBottom: space[2],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    selected: { borderColor: c.action, backgroundColor: c.lilac },
    unavailable: { opacity: 0.55, borderStyle: 'dashed' },
    // Not a choice: dashed, quiet, and the same size as an option so the two sit side by side.
    placeholder: {
      minWidth: 104,
      flexGrow: 1,
      flexBasis: 104,
      gap: 2,
      paddingHorizontal: space[3],
      paddingTop: space[3],
      paddingBottom: space[2],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.line,
    },
    tagSoft: { backgroundColor: c.accentSubtle, borderWidth: 1, borderColor: c.accentInk },
    // The tag hangs over the option's top edge, so every option is the same height with or without one.
    tag: {
      position: 'absolute',
      top: -10,
      left: space[3],
      paddingHorizontal: space[2],
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
    pressed: { opacity: 0.8 },
    priceLine: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[2],
    },
    // How many of this size are in the cart: a small cart with the number, in the action colour.
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      minWidth: 30,
      justifyContent: 'center',
      paddingHorizontal: space[1] + 2,
      borderRadius: radius.full,
      backgroundColor: c.action,
    },
  });

/**
 * The sizes a product comes in, as tappable options: each shows its size and price, the price per litre, kilogram
 * or piece so sizes can be compared, and a "Best value" tag on the cheapest per unit. The chosen one has the
 * action colour as its edge. An out-of-stock size is dimmed and cannot be chosen.
 */
export function PackPicker({
  title,
  options,
  selectedId,
  onSelect,
  placeholder,
  tagTone = 'solid',
}: PackPickerProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.group} role="radiogroup" aria-label={title}>
      <Text variant="strong">{title}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          const unavailable = option.unavailableLabel !== undefined;
          return (
            <Pressable
              key={option.id}
              role="radio"
              aria-checked={selected}
              aria-disabled={unavailable}
              aria-label={[
                option.label,
                option.priceLabel,
                option.mrpLabel,
                option.saveLabel,
                option.unitLabel,
                option.tagLabel,
                option.inCartLabel,
                option.unavailableLabel,
              ]
                .filter((part) => part !== undefined)
                .join('. ')}
              disabled={unavailable}
              onPress={() => {
                onSelect(option.id);
              }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                unavailable && styles.unavailable,
                pressed && styles.pressed,
              ]}
            >
              {option.tagLabel !== undefined ? (
                <View style={[styles.tag, tagTone === 'soft' && styles.tagSoft]}>
                  <Text
                    variant="caption"
                    color={tagTone === 'soft' ? 'accentInk' : 'onAccent'}
                    numberOfLines={1}
                  >
                    {option.tagLabel}
                  </Text>
                </View>
              ) : null}
              <View style={styles.top}>
                <Text variant="strong">{option.label}</Text>
                {option.inCart !== undefined && option.inCart > 0 ? (
                  <View style={styles.badge} aria-hidden>
                    <Icon name="bag" color={colors.onAction} size={12} />
                    <Text variant="caption" color="onAction">
                      {String(option.inCart)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.priceLine}>
                <Text variant="label">{option.priceLabel}</Text>
                {option.mrpLabel !== undefined ? (
                  <Text variant="fine" color="inkMuted" strike>
                    {option.mrpLabel}
                  </Text>
                ) : null}
              </View>
              {option.saveLabel !== undefined && option.unavailableLabel === undefined ? (
                <Text variant="caption" color="accentInk" numberOfLines={1}>
                  {option.saveLabel}
                </Text>
              ) : null}
              <Text variant="small" color="inkMuted" numberOfLines={1}>
                {option.unavailableLabel ?? option.unitLabel ?? ' '}
              </Text>
            </Pressable>
          );
        })}

        {placeholder !== undefined ? (
          <View
            style={styles.placeholder}

            accessible

            aria-label={`${placeholder.title}. ${placeholder.body}`}
          >
            <Text variant="strong" color="inkMuted">
              {placeholder.title}
            </Text>

            <Text variant="small" color="inkMuted">
              {placeholder.body}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
