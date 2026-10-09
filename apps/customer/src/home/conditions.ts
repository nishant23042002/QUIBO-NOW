import { useSyncExternalStore } from 'react';

/**
 * What is going on today that changes what delivery costs and how the cart looks: a festival day, rain, a rush hour
 * forced on, and whether the town is served by partner shops or one dark store. In the real app the town's settings and
 * the weather say so (Phase 2); until then switches on the Profile screen (development builds only) stand in, so each
 * can be seen and tested.
 */
export interface Conditions {
  festival: boolean;
  rain: boolean;
  /** Treat the delivery as rush hour whatever the clock says. */
  rush: boolean;
  /** How the town is supplied. Only the cart reads it so far. */
  store: 'partner' | 'dark';
  /** How fast the mock order clock moves an order along: a whole order in about a minute, or six times slower. */
  orderSpeed: 'fast' | 'slow';
}

const listeners = new Set<() => void>();
let current: Conditions = {
  festival: false,
  rain: false,
  rush: false,
  store: 'partner',
  orderSpeed: 'fast',
};

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const read = (): Conditions => current;

export function setConditions(change: Partial<Conditions>): void {
  current = { ...current, ...change };
  listeners.forEach((listener) => {
    listener();
  });
}

export function useConditions(): Conditions {
  return useSyncExternalStore(subscribe, read, read);
}
