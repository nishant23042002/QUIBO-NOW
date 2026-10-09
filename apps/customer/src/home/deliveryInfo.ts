import { useLanguage } from '@/i18n/LanguageProvider';
import { useAddresses } from './AddressProvider';
import { formatAddress } from './addresses';
import { useCart } from './CartProvider';
import { useSlotText } from './slotText';

/** When the order arrives, in words, for the places that say so. */
export interface DeliveryWhen {
  /** The line for a heading, for example "Delivering in 15–20 mins" or "Arriving today, 5–6 PM". */
  headline: string;
  /** The short form for a card or a header, for example "15–20 mins" or "Today, 5–6 PM". */
  short: string;
  /** Quick delivery, rather than a window the shopper picked. */
  quick: boolean;
}

/**
 * When the order arrives: the one delivery choice the cart holds, in words. Home's header, the product page, the item cards
 * and the cart all say it through this, so they can never disagree: quick delivery with its estimate in minutes, or the
 * window the shopper picked. If quick delivery has closed and there is no window to fall back on, it says so.
 */
export function useDeliveryWhen(): DeliveryWhen {
  const { t } = useLanguage();
  const { delivery } = useCart();
  const slotText = useSlotText();
  const { current, eta } = delivery;

  if (current === undefined) {
    const closed = t('cart.quickClosed');
    return { headline: closed, short: closed, quick: false };
  }
  if (current.kind === 'quick') {
    return {
      headline: t('cart.quickTitle', { from: eta.from, to: eta.to }),
      short: t('cart.quickSub', { from: eta.from, to: eta.to }),
      quick: true,
    };
  }
  return {
    headline: slotText.arriving(current.slot),
    short: slotText.dayWindow(current.slot),
    quick: false,
  };
}

/** What an address is called, in the app's language: "Home", "Work" or "Other". */
export function useAddressLabel(): (label: 'home' | 'work' | 'other') => string {
  const { t } = useLanguage();
  return (label) => t(`address.labels.${label}`);
}

/**
 * The address the order goes to, in one line: the one chosen in the saved addresses. Home's header, the product page and the
 * cart all read it here, so choosing another address changes all of them at once. With none saved it asks for one.
 */
export function useDeliveryAddress(): string {
  const { t } = useLanguage();
  const { selected, loaded } = useAddresses();
  const labelText = useAddressLabel();
  if (!loaded) return '';
  return selected === undefined
    ? t('address.none')
    : formatAddress(selected, labelText(selected.label));
}
