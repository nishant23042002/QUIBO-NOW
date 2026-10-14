import { useSyncExternalStore } from 'react';
import { readSetting, writeSetting } from '@/storage';
import {
  EMPTY_NOTIFY,
  NOTIFY_KEY,
  isNotified,
  mergeNotify,
  parseNotify,
  serializeNotify,
  toggleNotify,
  type NotifyData,
} from './notify';

/**
 * The shopper's Notify me choices, kept on the phone (ADR 0055, decision 6). One store for the whole app, so a tile on Home, a tile
 * in the Categories tab and the "Coming to Roha" page always agree. It is read back from storage the first time something asks for
 * it, and written whenever it changes.
 */
const listeners = new Set<() => void>();
let current: NotifyData = EMPTY_NOTIFY;
let started = false;

function emit(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

function start(): void {
  if (started) return;
  started = true;
  void readSetting(NOTIFY_KEY).then((raw) => {
    current = mergeNotify(parseNotify(raw), current);
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

const read = (): NotifyData => current;

function toggle(id: string): void {
  current = toggleNotify(current, id, new Date());
  emit();
  void writeSetting(NOTIFY_KEY, serializeNotify(current));
}

/** Whether the shopper asked to hear about `id`, and a way to turn that on or off. */
export function useNotify(): { has: (id: string) => boolean; toggle: (id: string) => void } {
  const data = useSyncExternalStore(subscribe, read, read);
  return { has: (id) => isNotified(data, id), toggle };
}
