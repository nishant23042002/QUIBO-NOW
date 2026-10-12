import { createContext } from 'react';
import type { DeliveryWhen } from './deliveryInfo';

/**
 * When the order arrives, held by the cart's provider and read by whatever says it (the header, the item cards, the item page).
 * It changes only when the words do, not each time something is added, so a card that says it is not redrawn by the cart.
 */
export const DeliveryWhenContext = createContext<DeliveryWhen | null>(null);
