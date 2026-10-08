import { useSyncExternalStore } from 'react';

/**
 * TEMPORARY, for choosing the product page header's colour on a phone. "tint" is the soft colour of the Home
 * header (the product's category tint); "purple" is the deep aubergine of the app's dark bars. Tapping the
 * delivery line on the product page switches between them. Once one is chosen, this file, the tap and the
 * other look are deleted.
 */
export type HeaderLook = 'tint' | 'purple';

let current: HeaderLook = 'tint';
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleHeaderLook(): void {
  current = current === 'tint' ? 'purple' : 'tint';
  listeners.forEach((listener) => {
    listener();
  });
}

export function useHeaderLook(): HeaderLook {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
}
