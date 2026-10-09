import { useLanguage } from '@/i18n/LanguageProvider';
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

/**
 * The address the order goes to, in one line. There is one sample address until the address screens are built (1e); Home's
 * header, the product page and the cart all read it here, so choosing an address will change all of them at once.
 */
export function useDeliveryAddress(): string {
  const { t } = useLanguage();
  return t('home.header.fullAddress');
}
