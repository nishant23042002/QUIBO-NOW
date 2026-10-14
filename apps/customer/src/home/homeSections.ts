import { useOrders } from '@/orders/OrdersProvider';
import { readLeanSwitch, sectionShown, type LeanSection } from './homeLean';

/**
 * Expo writes `EXPO_PUBLIC_*` values into the app where it reads them, so this has to be spelled out and not looked up by a name
 * held in a variable.
 */
const RAW_LEAN: unknown = process.env.EXPO_PUBLIC_HOME_FIRST_RUN_LEAN;
const LEAN = typeof RAW_LEAN === 'string' && readLeanSwitch(RAW_LEAN);

/** Home's "is this section shown?" for the customer using the app now. */
export function useHomeSectionShown(): (section: LeanSection) => boolean {
  const { loaded, orders } = useOrders();
  return (section) =>
    sectionShown(section, { lean: LEAN, ordersLoaded: loaded, orderCount: orders.length });
}
