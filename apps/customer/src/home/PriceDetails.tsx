import { add, formatRupees, subtract, type Money } from '@quibo/contracts';
import type { MessageKey } from '@quibo/i18n';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Text, space } from '@/ui';
import type { Bill } from './bill';
import { ZONE, type CareClass } from './delivery';

/** The words for each class of care, which explain the handling fee. */
const CARE_NOTE: Readonly<Record<CareClass, MessageKey>> = {
  standard: 'cart.careStandard',
  fresh: 'cart.careFresh',
  chilled: 'cart.careChilled',
  heavy: 'cart.careHeavy',
  fragile: 'cart.careFragile',
};

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
  label: { flexShrink: 1 },
});

/** How far a trip is, for words: 2.4, or 3 for 3.0. */
export function kmLabel(km: number): string {
  return String(Math.round(km * 10) / 10);
}

function Line({ label, amount, sign = '' }: { label: string; amount: Money; sign?: string }) {
  return (
    <View style={styles.line}>
      <View style={styles.label}>
        <Text variant="small" color="inkMuted">
          {label}
        </Text>
      </View>
      <Text variant="small">{`${sign}${formatRupees(amount)}`}</Text>
    </View>
  );
}

/**
 * What the delivery fee is made of: the distance, and anything a rush hour, a festival day or rain added, with a line
 * when the fee was held down to its top. When delivery is free, it says why and what it would have cost. This is the
 * content of the popover beside the delivery charge.
 */
export function DeliveryDetails({ bill, distanceKm }: { bill: Bill; distanceKm: number }) {
  const { t } = useLanguage();
  const { parts, free, fee, waived } = bill.delivery;

  return (
    <>
      <View style={styles.head}>
        <Text variant="label">{t('cart.whyDelivery')}</Text>
        <Text variant="label" color={free ? 'success' : 'ink'}>
          {free ? t('cart.free') : formatRupees(fee)}
        </Text>
      </View>
      {free ? (
        <Text variant="small" color="inkMuted">
          {t('cart.whyFree', {
            amount: formatRupees(ZONE.freeDeliveryFrom),
            fee: formatRupees(waived),
          })}
        </Text>
      ) : (
        <>
          <Line
            label={t('cart.whyDistance', { km: kmLabel(distanceKm) })}
            amount={parts.distance}
          />
          {parts.rush > 0 ? <Line label={t('cart.whyRush')} amount={parts.rush} sign="+" /> : null}
          {parts.festival > 0 ? (
            <Line label={t('cart.whyFestival')} amount={parts.festival} sign="+" />
          ) : null}
          {parts.rain > 0 ? <Line label={t('cart.whyRain')} amount={parts.rain} sign="+" /> : null}
          {parts.capped ? (
            <Line
              label={t('cart.whyTrim')}
              amount={subtract(
                add(add(add(parts.distance, parts.rush), parts.festival), parts.rain),
                parts.fee,
              )}
              sign={'−'}
            />
          ) : null}
          <Text variant="fine" color="inkMuted">
            {t('cart.whyCapped', { max: formatRupees(ZONE.delivery.max) })}
          </Text>
        </>
      )}
    </>
  );
}

/** Why the handling fee is what it is: the care the most delicate item needs, and a festival day if one added to it. */
export function HandlingDetails({ bill }: { bill: Bill }) {
  const { t } = useLanguage();
  const note = [
    bill.handling.reason !== undefined ? t(CARE_NOTE[bill.handling.reason]) : '',
    bill.handling.festival ? t('cart.festival') : '',
  ]
    .filter((part) => part !== '')
    .join(' · ');

  return (
    <>
      <View style={styles.head}>
        <Text variant="label">{t('cart.handlingFee')}</Text>
        <Text variant="label">{formatRupees(bill.handling.fee)}</Text>
      </View>
      <Text variant="small" color="inkMuted">
        {note}
      </Text>
    </>
  );
}

/** What the order saves: the discount on the printed prices, and the delivery fee when delivery is free. */
export function SavingsDetails({ bill }: { bill: Bill }) {
  const { t } = useLanguage();

  return (
    <>
      <View style={styles.head}>
        <Text variant="label" color="success">
          {t('cart.savingsTitle')}
        </Text>
        <Text variant="label" color="success">
          {formatRupees(bill.totalSaved)}
        </Text>
      </View>
      {bill.saved > 0 ? <Line label={t('cart.savingsPrinted')} amount={bill.saved} /> : null}
      {bill.coupon !== undefined ? (
        <Line
          label={t('cart.couponRow', { code: bill.coupon.code })}
          amount={bill.coupon.discount}
        />
      ) : null}
      {bill.delivery.free ? (
        <Line label={t('cart.savingsDelivery')} amount={bill.delivery.waived} />
      ) : null}
    </>
  );
}
