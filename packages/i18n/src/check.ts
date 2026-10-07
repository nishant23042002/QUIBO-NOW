/** A message file flattened to dotted keys: { "home.title": "..." }. */
export type FlatMessages = Record<string, string>;

/**
 * Flatten a nested message tree. Every leaf must be a string; numbers, arrays, null and
 * the like throw, because message files hold text only.
 */
export function flattenMessages(tree: unknown, prefix = ''): FlatMessages {
  const flat: FlatMessages = {};
  if (typeof tree !== 'object' || tree === null || Array.isArray(tree)) {
    throw new TypeError(`${prefix || '(root)'} must be an object of messages`);
  }
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      flat[path] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flat, flattenMessages(value, path));
    } else {
      throw new TypeError(`${path} must be a string or an object of messages`);
    }
  }
  return flat;
}

/** Keys the candidate lacks, and keys it has that the reference does not. Both sorted. */
export function diffKeys(
  reference: FlatMessages,
  candidate: FlatMessages,
): { missing: string[]; extra: string[] } {
  const has = (flat: FlatMessages, key: string) => Object.prototype.hasOwnProperty.call(flat, key);
  return {
    missing: Object.keys(reference)
      .filter((key) => !has(candidate, key))
      .sort(),
    extra: Object.keys(candidate)
      .filter((key) => !has(reference, key))
      .sort(),
  };
}

/**
 * Names of the {placeholders} in a message, sorted and unique. Also finds the argument of an
 * ICU form such as "{count, plural, one {# item} other {# items}}" (that gives "count").
 */
export function placeholderNames(message: string): string[] {
  const names = new Set<string>();
  for (const match of message.matchAll(/\{\s*([A-Za-z_]\w*)/g)) {
    const name = match[1];
    if (name !== undefined) names.add(name);
  }
  return [...names].sort();
}
