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
import { useOnline } from '@/network';
import { readSetting, writeSetting } from '@/storage';
import { advance, cancelByCustomer, nextDueAt, type TrackedOrder } from './machine';
import {
  DEFAULT_PLAN,
  parseOrders,
  placeOnce,
  serialiseOrders,
  type ClockPlan,
  type PlaceRequest,
} from './place';

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
  place: (request: PlaceRequest, plan?: ClockPlan) => Order;
  /**
   * The customer cancels an order. "too_late" when the shop had already packed it by the time of the tap (the order is left as it
   * is), "missing" when there is no such order.
   */
  cancel: (id: string) => 'cancelled' | 'too_late' | 'missing';
  /** One order by its id, if it is kept on the phone. */
  find: (id: string) => TrackedOrder | undefined;
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

  // The mock order clock: makes each move of each order when it is due, and sleeps until the next one. With no connection nothing
  // moves, as it would be if the updates could not arrive; when the phone is back online it catches up, with the true times.
  const online = useOnline();
  useEffect(() => {
    if (!loaded || !online) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      const moved = current.current.map((tracked) => advance(tracked, new Date()));
      if (moved.some((tracked, index) => tracked !== current.current[index])) {
        current.current = moved;
        setOrders(moved);
      }
      const due = moved.flatMap((tracked) => nextDueAt(tracked) ?? []);
      if (due.length > 0) timer = setTimeout(run, Math.max(250, Math.min(...due) - Date.now()));
    };
    timer = setTimeout(run, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [loaded, online, orders]);

  const place = useCallback((request: PlaceRequest, plan: ClockPlan = DEFAULT_PLAN): Order => {
    touched.current = true;
    const result = placeOnce(current.current, request, plan);
    current.current = result.orders;
    setOrders(result.orders);
    if (result.created) setJustPlaced(result.order);
    return result.order;
  }, []);

  const cancel = useCallback((id: string): 'cancelled' | 'too_late' | 'missing' => {
    const index = current.current.findIndex((tracked) => tracked.order.id === id);
    const tracked = current.current[index];
    if (tracked === undefined) return 'missing';
    const result = cancelByCustomer(tracked, new Date());
    const next = current.current.map((candidate, at) => (at === index ? result : candidate));
    current.current = next;
    setOrders(next);
    const last = result.order.events[result.order.events.length - 1];
    return result.order.status === 'cancelled' && last?.by === 'customer'
      ? 'cancelled'
      : 'too_late';
  }, []);

  const find = useCallback(
    (id: string) => orders.find((tracked) => tracked.order.id === id),
    [orders],
  );

  const dismissPlaced = useCallback(() => {
    setJustPlaced(null);
  }, []);

  const value: Orders = {
    loaded,
    orders,
    latest: orders[0],
    place,
    cancel,
    find,
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
