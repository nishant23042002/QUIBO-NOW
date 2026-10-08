import type { Messages } from './messages';

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Every message key as a dotted path, such as "home.title". A wrong key fails to compile. */
export type MessageKey = Leaves<Messages>;

/** Values for the {placeholders} in a message. */
export type MessageValues = Readonly<Record<string, string | number>>;

/**
 * Look up one message and fill its {placeholders}.
 *
 * Small on purpose: no plurals, dates or numbers yet. Add a library when a screen needs them.
 * A placeholder with no value stays visible as {name}, so a missing value shows up in a
 * screenshot instead of being silently blank. A key that slipped past the types returns the
 * key itself for the same reason.
 */
export function translate(messages: Messages, key: MessageKey, values?: MessageValues): string {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    node =
      typeof node === 'object' && node !== null
        ? (node as Record<string, unknown>)[part]
        : undefined;
  }
  if (typeof node !== 'string') return key;

  return node.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values?.[name];
    return value === undefined ? placeholder : String(value);
  });
}
