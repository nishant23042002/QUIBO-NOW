import {
  CART_KEY,
  COUPON_KEY,
  INSTRUCTIONS_KEY,
  NOTIFY_KEY,
  ORDERS_KEY,
  REPORTS_KEY,
  SAVED_KEY,
  SLOT_KEY,
  SUBSTITUTION_KEY,
  VIEWED_KEY,
} from '../storageKeys';

/**
 * What testing leaves on a phone: the orders placed and the help reports about them, the cart with what was put aside, the coupon,
 * delivery window, substitution choice and delivery notes that went with it, the products opened (Continue browsing) and the Notify
 * me choices. The testing tool clears exactly these. The language, theme, account and saved addresses are not in the list, so a
 * clear does not sign the tester out or lose their address.
 */
export const TEST_DATA_KEYS: readonly string[] = [
  ORDERS_KEY,
  REPORTS_KEY,
  CART_KEY,
  SAVED_KEY,
  COUPON_KEY,
  SLOT_KEY,
  SUBSTITUTION_KEY,
  INSTRUCTIONS_KEY,
  VIEWED_KEY,
  NOTIFY_KEY,
];
