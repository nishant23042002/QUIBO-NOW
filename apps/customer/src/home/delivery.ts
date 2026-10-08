import { money } from '@quibo/contracts';

/**
 * The order total from which delivery is free: 199 rupees. A sample until each town's own fee rules arrive
 * (Phase 2); the offers and the cart both read it from here, so they always agree.
 */
export const FREE_DELIVERY_FROM = money(19_900);
