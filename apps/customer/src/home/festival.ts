import { useSyncExternalStore } from 'react';

/**
 * Whether a festival rush is on, which raises the handling fee a little. In the real app the town's settings say so
 * (Phase 2); until then a switch on the Profile screen (development builds only) stands in, so the busier fee can be
 * seen and tested.
 */
const listeners = new Set<() => void>();
let rush = false;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const read = (): boolean => rush;

export function setFestival(value: boolean): void {
  rush = value;
  listeners.forEach((listener) => {
    listener();
  });
}

export function useFestival(): boolean {
  return useSyncExternalStore(subscribe, read, read);
}
