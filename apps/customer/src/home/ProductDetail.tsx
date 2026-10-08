import { Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  DietMark,
  DiscountRibbon,
  Icon,
  PriceBadge,
  Sheet,
  Stepper,
  Text,
  radius,
  space,
} from '@/ui';
import type { HomeItem } from './items';

interface ProductDetailProps {
  /** The item to show, or null while the sheet is shut. */
  item: HomeItem | null;
  /** The colour behind its picture: the same as on its card. */
  tint: string;
  quantity: number;
  onQuantityChange: (next: number) => void;
  onClose: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    picture: {
      height: 180,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
    },
    ribbon: { position: 'absolute', top: 0, left: space[4] },
    row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    facts: { gap: space[2] },
    fact: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  });

/**
 * What opens when an item is tapped: a bigger picture, the price, the pack, whether it is vegetarian, which
 * shop sells it and when it can come, with ADD (or the stepper) pinned at the bottom. A bottom sheet, so the
 * page stays where it was.
 */
export function ProductDetail({
  item,
  tint,
  quantity,
  onQuantityChange,
  onClose,
}: ProductDetailProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const out = item?.stock?.kind === 'out';

  return (
    <Sheet
      open={item !== null}
      onClose={onClose}
      title={item?.name ?? ''}
      closeLabel={t('common.close')}
      footer={
        item === null ? undefined : (
          <View style={styles.footer}>
            <PriceBadge
              amount={item.price}
              {...(item.mrp !== undefined ? { mrp: item.mrp } : {})}
            />
            {out ? (
              <Text variant="strong" color="inkMuted">
                {item.stock?.label}
              </Text>
            ) : (
              <Stepper
                value={quantity}
                onChange={onQuantityChange}
                addLabel={t('home.rails.add')}
                decreaseLabel={t('home.rails.removeOne')}
                increaseLabel={t('home.rails.addOne')}
              />
            )}
          </View>
        )
      }
    >
      {item === null ? null : (
        <>
          <View style={[styles.picture, { backgroundColor: tint }]}>
            <NativeText
              allowFontScaling={false}
              style={{ fontSize: 96, lineHeight: 120 }}
              aria-hidden
            >
              {item.emoji}
            </NativeText>
            {item.ribbon !== undefined && !out ? (
              <View style={styles.ribbon}>
                <DiscountRibbon amount={item.ribbon.amount} offLabel={item.ribbon.offLabel} />
              </View>
            ) : null}
          </View>
          <View style={styles.row}>
            <DietMark kind={item.diet.kind} label={item.diet.label} size={18} />
            <Text color="inkMuted">{item.pack}</Text>
          </View>
          <View style={styles.facts}>
            <View style={styles.fact}>
              <Icon name="store" color={colors.accentInk} size={18} />
              <Text variant="strong">{t('home.detail.soldBy', { shop: item.shopName })}</Text>
            </View>
            {item.quickLabel !== undefined && !out ? (
              <View style={styles.fact}>
                <Icon name="clock" color={colors.accentInk} size={18} />
                <Text variant="strong">{item.quickLabel}</Text>
              </View>
            ) : null}
            {item.stock?.kind === 'low' ? (
              <Text variant="strong" color="warning">
                {item.stock.label}
              </Text>
            ) : null}
          </View>
          <Text color="inkMuted">{t('home.detail.about')}</Text>
        </>
      )}
    </Sheet>
  );
}
