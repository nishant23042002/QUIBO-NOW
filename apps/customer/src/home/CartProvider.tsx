import {
  createContext,
  startTransition,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useDraftCart, type DraftCart } from './cart';
import { useDeliveryWhenFor } from './deliveryInfo';
import { DeliveryWhenContext } from './deliveryWhenContext';
import { createQuantityStore, type QuantityStore } from './quantityStore';

const CartContext = createContext<DraftCart | null>(null);
const StoreContext = createContext<QuantityStore | null>(null);

/** What a card needs to change the cart. It never changes, so a card that holds it is not redrawn by the cart. */
export interface CartActions {
  setQuantity: (packId: string, next: number) => void;
}
const ActionsContext = createContext<CartActions | null>(null);

/**
 * Holds the cart for the whole app, so Home, a shop's page and the cart sheet all fill and read the same one.
 * It sits inside the language provider, because the cart words its own labels.
 *
 * Besides the whole cart (`useCart`, for the screens that show all of it) it shares three small, steady things: how many of one pack
 * (`useQuantity`), how many items there are (`useCartCount`) and the action to change the cart (`useCartActions`). A card reads
 * only those, so adding an item redraws that one card, the cart bar and the badge, instead of every card on the page.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useDraftCart();
  const [store] = useState(createQuantityStore);
  const latest = useRef(cart);
  const when = useDeliveryWhenFor(cart.delivery);
  const { headline, short, quick, label } = when;
  const sharedWhen = useMemo(
    () => ({ headline, short, quick, label }),
    [headline, short, quick, label],
  );

  // The numbers the cards read follow the cart as soon as it has settled, in the same frame, before anything is drawn.
  useLayoutEffect(() => {
    latest.current = cart;
    store.settle(cart.quantities, cart.count);
  });

  const actions = useMemo<CartActions>(
    () => ({
      // The control shows the new number in the same frame as the press (it draws alone, and is cheap). The cart works out the rest
      // (totals, the bill, the bar's words) as a transition: the finger and the control are never made to wait for it.
      setQuantity: (packId, next) => {
        store.expect(packId, latest.current.allowedQuantity(packId, next));
        startTransition(() => {
          latest.current.setQuantity(packId, next);
        });
      },
    }),
    [store],
  );

  return (
    <CartContext.Provider value={cart}>
      <StoreContext.Provider value={store}>
        <ActionsContext.Provider value={actions}>
          <DeliveryWhenContext.Provider value={sharedWhen}>{children}</DeliveryWhenContext.Provider>
        </ActionsContext.Provider>
      </StoreContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart(): DraftCart {
  const cart = useContext(CartContext);
  if (cart === null) throw new Error('useCart must be used inside CartProvider');
  return cart;
}

function useStore(): QuantityStore {
  const store = useContext(StoreContext);
  if (store === null) throw new Error('The cart hooks must be used inside CartProvider');
  return store;
}

/** How many of one pack are in the cart. Only a change to this pack redraws the reader. */
export function useQuantity(packId: string): number {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, () => store.get(packId));
}

/** Whether anything is in the cart, the instant a tap has asked for it. Only a change to that redraws the reader. */
export function useHasItems(): boolean {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.hasItems);
}

/** How many items are in the cart. Only a change to the count redraws the reader. */
export function useCartCount(): number {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.count);
}

/** The action to change the cart: steady, so it never redraws the reader. */
export function useCartActions(): CartActions {
  const actions = useContext(ActionsContext);
  if (actions === null) throw new Error('useCartActions must be used inside CartProvider');
  return actions;
}
