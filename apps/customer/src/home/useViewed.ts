import { useSyncExternalStore } from 'react';
import { readSetting, writeSetting } from '@/storage';
import { VIEWED_KEY, forgetItem, parseViewed, serializeViewed, viewItem } from './viewed';

/**
 * What the shopper opened last, kept on the phone (ADR 0055, step 7). One store for the whole app: the product page puts an id in
 * it, Home's "Continue browsing" reads it. It is read back from storage the first time something asks for it, and written whenever
 * it changes.
 */
const listeners = new Set<() => void>();
let current: readonly string[] = [];
let started = false;

function emit(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

function start(): void {
  if (started) return;
  started = true;
  void readSetting(VIEWED_KEY).then((raw) => {
    // Anything opened before the saved list was read back stays in front.
    const saved = parseViewed(raw);
    current = [...current, ...saved.filter((id) => !current.includes(id))];
    emit();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

const read = (): readonly string[] => current;

function save(next: readonly string[]): void {
  current = next;
  emit();
  void writeSetting(VIEWED_KEY, serializeViewed(next));
}

/** Notes that the shopper opened a product. Called by the product page; it needs no hook. */
export function noteViewed(id: string): void {
  start();
  if (current[0] === id) return;
  save(viewItem(current, id));
}

/** The ids opened, newest first, and ways to take one away or clear the list. */
export function useViewed(): {
  ids: readonly string[];
  forget: (id: string) => void;
  clear: () => void;
} {
  const ids = useSyncExternalStore(subscribe, read, read);
  return {
    ids,
    forget: (id) => {
      save(forgetItem(current, id));
    },
    clear: () => {
      save([]);
    },
  };
}
