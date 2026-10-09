import { add, formatRupees, subtract, type Money } from '@quibo/contracts';
import type { MessageKey } from '@quibo/i18n';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Sheet, Text, radius, space } from '@/ui';
import type { Bill } from './bill';
import { ZONE, type CareClass } from './delivery';

/** The words for each class of care, which explain the handling fee. */
export const CARE_NOTE: Readonly<Record<CareClass, MessageKey>> = {
  standard: 'cart.careStandard',
  fresh: 'cart.careFresh',
  chilled: 'cart.careChilled',
  heavy: 'cart.careHeavy',
  fragile: 'cart.careFragile',
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    body: { gap: space[4] },
    group: {
      gap: space[1],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
    },
    head: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
    line: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
    label: { flexShrink: 1 },
  });

/** How far a trip is, for words: 2.4, or 3 for 3.0. */
export function kmLabel(km: number): string {
  return String(Math.round(km * 10) / 10);
}

/**
 * "Why this price?": what the delivery fee is made of (the distance, and anything a rush hour, a festival or rain added),
 * why the handling fee is what it is, and what the order saves. Plain lines with one amount each, opened from the
 * little (i) beside a charge or from the savings.
 */
export function PriceSheet({
  open,
  onClose,
  bill,
  distanceKm,
}: {
  open: boolean;
  onClose: () => void;
  bill: Bill;
  distanceKm: number;
}) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { parts } = bill.delivery;

  const row = (label: string, amount: Money, sign = '') => (
    <View key={label} style={styles.line}>
      <View style={styles.label}>
        <Text variant="body" color="inkMuted">
          {label}
        </Text>
      </View>
      <Text variant="body">{`${sign}${formatRupees(amount)}`}</Text>
    </View>
  );

  return (
    <Sheet open={open} onClose={onClose} title={t('cart.whyTitle')} closeLabel={t('common.close')}>
      <View style={styles.body}>
        <View style={styles.group}>
          <View style={styles.head}>
            <Text variant="label">{t('cart.whyDelivery')}</Text>
            <Text variant="label" color={bill.delivery.free ? 'success' : 'ink'}>
              {bill.delivery.free ? t('cart.free') : formatRupees(bill.delivery.fee)}
            </Text>
          </View>
          {row(t('cart.whyDistance', { km: kmLabel(distanceKm) }), parts.distance)}
          {parts.rush > 0 ? row(t('cart.whyRush'), parts.rush, '+') : null}
          {parts.festival > 0 ? row(t('cart.whyFestival'), parts.festival, '+') : null}
          {parts.rain > 0 ? row(t('cart.whyRain'), parts.rain, '+') : null}
          {parts.capped
            ? row(
                t('cart.whyTrim'),
                subtract(
                  add(add(add(parts.distance, parts.rush), parts.festival), parts.rain),
                  parts.fee,
                ),
                '−',
              )
            : null}
          <Text variant="small" color="inkMuted">
            {bill.delivery.free
              ? t('cart.whyFree', {
                  amount: formatRupees(ZONE.freeDeliveryFrom),
                  fee: formatRupees(bill.delivery.waived),
                })
              : t('cart.whyCapped', { max: formatRupees(ZONE.delivery.max) })}
          </Text>
        </View>
        <View style={styles.group}>
          <View style={styles.head}>
            <Text variant="label">{t('cart.handlingFee')}</Text>
            <Text variant="label">{formatRupees(bill.handling.fee)}</Text>
          </View>
          <Text variant="small" color="inkMuted">
            {[
              bill.handling.reason !== undefined ? t(CARE_NOTE[bill.handling.reason]) : '',
              bill.handling.festival ? t('cart.festival') : '',
            ]
              .filter((part) => part !== '')
              .join(' · ')}
          </Text>
        </View>
        {bill.totalSaved > 0 ? (
          <View style={styles.group}>
            <View style={styles.head}>
              <Text variant="label" color="success">
                {t('cart.savingsTitle')}
              </Text>
              <Text variant="label" color="success">
                {formatRupees(bill.totalSaved)}
              </Text>
            </View>
            {bill.saved > 0 ? row(t('cart.savingsPrinted'), bill.saved) : null}
            {bill.delivery.free ? row(t('cart.savingsDelivery'), bill.delivery.waived) : null}
          </View>
        ) : null}
      </View>
    </Sheet>
  );
}
