import { useContext } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useAddresses } from './AddressProvider';
import { formatAddress } from './addresses';
import type { DraftCart } from './cart';
import { DeliveryWhenContext } from './deliveryWhenContext';
import { useSlotText } from './slotText';

/** When the order arrives, in words, for the places that say so. */
export interface DeliveryWhen {
  /** The line for a heading, for example "Delivering in 15–20 mins" or "Arriving today, 5–6 PM". */
  headline: string;
  /** The short form for a card or a header, for example "15–20 mins" or "Today, 5–6 PM". */
  short: string;
  /** Quick delivery, rather than a window the shopper picked. */
  quick: boolean;
  /** The small line over `short` in the header: "Estimated delivery" for the quick estimate, "Scheduled delivery" for a window. */
  label: string;
}

/**
 * Works out when the order arrives from the cart's delivery choice, in words: quick delivery with its estimate in minutes, or the
 * window the shopper picked. If quick delivery has closed and there is no window to fall back on, it says so. The cart's provider
 * calls this once and shares the result (see `useDeliveryWhen`).
 */
export function useDeliveryWhenFor(delivery: DraftCart['delivery']): DeliveryWhen {
  const { t } = useLanguage();
  const slotText = useSlotText();
  const { current, eta } = delivery;

  if (current === undefined) {
    const closed = t('cart.quickClosed');
    return {
      headline: closed,
      short: closed,
      quick: false,
      label: t('home.header.deliveryLabel'),
    };
  }
  if (current.kind === 'quick') {
    return {
      headline: t('cart.quickTitle', { from: eta.from, to: eta.to }),
      short: t('cart.quickSub', { from: eta.from, to: eta.to }),
      quick: true,
      label: t('home.header.estimated'),
    };
  }
  return {
    headline: slotText.arriving(current.slot),
    short: slotText.dayWindow(current.slot),
    quick: false,
    label: t('home.header.scheduled'),
  };
}

/**
 * When the order arrives, as the cart's provider has worded it. Home's header, the product page, the item cards and the cart all say
 * it through this, so they can never disagree. It changes only when the words do, so reading it does not redraw a screen each time
 * something is added to the cart.
 */
export function useDeliveryWhen(): DeliveryWhen {
  const when = useContext(DeliveryWhenContext);
  if (when === null) throw new Error('useDeliveryWhen must be used inside CartProvider');
  return when;
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
