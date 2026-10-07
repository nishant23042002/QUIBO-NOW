import type en from '../messages/en.json';
import type hi from '../messages/hi.json';
import type mr from '../messages/mr.json';
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

/** Load one language. Each file is its own chunk, so a visitor downloads only theirs. */
export async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case 'en':
      return (await import('../messages/en.json')).default;
    case 'hi':
      return (await import('../messages/hi.json')).default;
    case 'mr':
      return (await import('../messages/mr.json')).default;
  }
}
