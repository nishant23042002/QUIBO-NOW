import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

/**
 * Whether the phone can reach the network, and a way to rehearse a bad connection while the app runs on mock data.
 *
 * On the web this follows the browser's own online and offline events. On a phone there is no such API in React
 * Native itself: it needs `@react-native-community/netinfo`, which has not been added yet (adding a dependency
 * needs a decision, see docs/phases/PHASE-1.md). Until then a phone counts as online, and the two switches below
 * (shown in development builds only, on the Profile screen) stand in for a real failure so the offline and error
 * screens can be seen and tested.
 */

const listeners = new Set<() => void>();
let simulatedOffline = false;
let failNext = false;

function notify(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

function browserOnline(): boolean {
  return Platform.OS !== 'web' || typeof navigator === 'undefined' || navigator.onLine;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('online', listener);
    window.addEventListener('offline', listener);
  }
  return () => {
    listeners.delete(listener);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.removeEventListener('online', listener);
      window.removeEventListener('offline', listener);
    }
  };
}

const isOnline = (): boolean => browserOnline() && !simulatedOffline;

/** True while the network can be reached. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, isOnline, isOnline);
}

/** What happens when a page tries to load right now: it works, there is no network, or the server fails. */
export type LoadOutcome = 'ok' | 'offline' | 'failed';

/** Called when a page loads (or loads again). A rehearsed failure is used up by the load that meets it. */
export function loadOutcome(): LoadOutcome {
  if (!isOnline()) return 'offline';
  if (failNext) {
    failNext = false;
    notify();
    return 'failed';
  }
  return 'ok';
}

// Development switches, for the Profile screen.

export function setSimulatedOffline(value: boolean): void {
  simulatedOffline = value;
  notify();
}

export function armFailNext(): void {
  failNext = true;
  notify();
}

export function useSimulatedOffline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => simulatedOffline,
    () => simulatedOffline,
  );
}

export function useFailNextArmed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => failNext,
    () => failNext,
  );
}
