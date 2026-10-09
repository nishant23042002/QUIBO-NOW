import { formatRupees } from '@quibo/contracts';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { BillRow } from '@/ui';
import { useCart } from './CartProvider';
import { SAMPLE_DISTANCE_KM } from './delivery';
import { DeliveryDetails, HandlingDetails, kmLabel } from './PriceDetails';

/**
 * The cart's bill as one plain line for each charge, with the little (i) that explains the delivery and handling fees. The cart
 * and checkout both show the bill through this, so they can never read differently.
 */
export function useBillRows(): BillRow[] {
  const { t } = useLanguage();
  const { bill, count } = useCart();
  return [
    { label: t('cart.itemsRow', { count }), amount: bill.itemTotal },
    ...(bill.coupon !== undefined
      ? [
          {
            label: t('cart.couponRow', { code: bill.coupon.code }),
            amount: bill.coupon.discount,
            valueLabel: `−${formatRupees(bill.coupon.discount)}`,
            positive: true,
          },
        ]
      : []),
    {
      label: t('cart.deliveryKm', { km: kmLabel(SAMPLE_DISTANCE_KM) }),
      amount: bill.delivery.fee,
      ...(bill.delivery.free ? { valueLabel: t('cart.free'), positive: true } : {}),
      info: <DeliveryDetails bill={bill} distanceKm={SAMPLE_DISTANCE_KM} />,
      infoLabel: t('cart.whyTitle'),
    },
    {
      label: t('cart.handlingFee'),
      amount: bill.handling.fee,
      info: <HandlingDetails bill={bill} />,
      infoLabel: t('cart.whyTitle'),
    },
    ...(bill.tip > 0 ? [{ label: t('extras.tipRow'), amount: bill.tip }] : []),
  ];
}
