import { createContext, useContext, type ReactNode } from 'react';
import { useDraftCart, type DraftCart } from './cart';

const CartContext = createContext<DraftCart | null>(null);

/**
 * Holds the cart for the whole app, so Home, a shop's page and the cart sheet all fill and read the same one.
 * It sits inside the language provider, because the cart words its own labels.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useDraftCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart(): DraftCart {
  const cart = useContext(CartContext);
  if (cart === null) throw new Error('useCart must be used inside CartProvider');
  return cart;
}
