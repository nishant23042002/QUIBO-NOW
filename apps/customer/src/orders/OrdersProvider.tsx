import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Order } from '@quibo/contracts';
import { readSetting, writeSetting } from '@/storage';
import type { TrackedOrder } from './machine';
import { parseOrders, placeOnce, serialiseOrders, type PlaceRequest } from './place';

/** Where the phone keeps the orders, so an order placed a moment ago is still there after the app is closed. */
const ORDERS_KEY = 'quibo.orders';

export interface Orders {
  /** False until the saved orders have been read back, so the Orders tab does not first look empty and then fill. */
  loaded: boolean;
  /** Every order kept on the phone, newest first, with the plan the mock clock follows. */
  orders: readonly TrackedOrder[];
  /** The newest order, if there is one. */
  latest: TrackedOrder | undefined;
  /** Places an order. The same key always gives the same order, so a retry never places a second one. */
  place: (request: PlaceRequest) => Order;
  /** The order that was just placed, while the "Order placed" screen is up. */
  justPlaced: Order | null;
  dismissPlaced: () => void;
}

const OrdersContext = createContext<Orders | null>(null);

/** Holds the shopper's orders for the whole app. They are kept on the phone until the server has them (Phase 2). */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<readonly TrackedOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [justPlaced, setJustPlaced] = useState<Order | null>(null);
  // The latest list, read straight away when two requests come close together, before a re-render has happened.
  const current = useRef<readonly TrackedOrder[]>([]);
  // An order placed before the saved ones have been read back must not be written over by them.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(ORDERS_KEY).then((saved) => {
      if (!live) return;
      if (!touched.current) {
        const read = parseOrders(saved);
        current.current = read;
        setOrders(read);
      }
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void writeSetting(ORDERS_KEY, serialiseOrders(orders));
  }, [loaded, orders]);

  const place = useCallback((request: PlaceRequest): Order => {
    touched.current = true;
    const result = placeOnce(current.current, request);
    current.current = result.orders;
    setOrders(result.orders);
    if (result.created) setJustPlaced(result.order);
    return result.order;
  }, []);

  const dismissPlaced = useCallback(() => {
    setJustPlaced(null);
  }, []);

  const value: Orders = {
    loaded,
    orders,
    latest: orders[0],
    place,
    justPlaced,
    dismissPlaced,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): Orders {
  const orders = useContext(OrdersContext);
  if (orders === null) throw new Error('useOrders must be used inside OrdersProvider');
  return orders;
}
