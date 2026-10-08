import en from '../messages/en.json';
import hi from '../messages/hi.json';
import mr from '../messages/mr.json';
import type { Locale } from './locales';

/** The shape of every message file, taken from English. */
export type Messages = typeof en;

type SameShape<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type MustBeTrue<T extends true> = T;

/**
 * Compile-time check: a key missing from, or extra in, hi.json or mr.json makes this fail
 * to typecheck. messages.test.ts checks the same thing at runtime and says which key.
 */
export type MessageShapeCheck = [
  MustBeTrue<SameShape<typeof hi, Messages>>,
  MustBeTrue<SameShape<typeof mr, Messages>>,
];

/** All three languages, loaded together. They are a few kilobytes, so there is nothing to fetch later. */
export const messages = { en, hi, mr } satisfies Record<Locale, Messages>;
