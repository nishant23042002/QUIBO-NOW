import { useSyncExternalStore } from 'react';
import { readSetting, writeSetting } from '@/storage';
import {
  EMPTY_REQUESTS,
  REQUESTS_KEY,
  addRequest,
  cleanRequest,
  parseRequests,
  serializeRequests,
  type RequestsData,
} from './askShops';

/**
 * What the shopper asked their shops for, kept on the phone (ADR 0055, step 8). One store for the whole app, read back from storage
 * the first time something asks for it and written whenever it changes. It goes to the shops in Phase 2.
 */
const listeners = new Set<() => void>();
let current: RequestsData = EMPTY_REQUESTS;
let started = false;

function emit(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

function start(): void {
  if (started) return;
  started = true;
  void readSetting(REQUESTS_KEY).then((raw) => {
    const saved = parseRequests(raw);
    // Anything asked before the saved list was read back stays in front of it.
    const fresh = current.requests.filter(
      (entry) => !saved.requests.some((old) => old.text.toLowerCase() === entry.text.toLowerCase()),
    );
    current = {
      requests: [...fresh, ...saved.requests],
      consentAt: saved.consentAt ?? current.consentAt,
      consentVersion: saved.consentVersion ?? current.consentVersion,
    };
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

const read = (): RequestsData => current;

/** Keeps a request. Returns false when the words were not enough to send (nothing is kept then). */
function ask(raw: string): boolean {
  const text = cleanRequest(raw);
  if (text === undefined) return false;
  current = addRequest(current, text, new Date());
  emit();
  void writeSetting(REQUESTS_KEY, serializeRequests(current));
  return true;
}

/** The requests so far (newest first) and a way to add one. */
export function useAskShops(): {
  requests: RequestsData['requests'];
  ask: (raw: string) => boolean;
} {
  const data = useSyncExternalStore(subscribe, read, read);
  return { requests: data.requests, ask };
}
