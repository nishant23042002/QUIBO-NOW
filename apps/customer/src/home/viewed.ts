/**
 * "Continue browsing" (ADR 0055, step 7): the things the shopper opened last, kept on the phone so the next visit can pick up where
 * they left off. Only a product's id is kept: no name, no time and nothing about the person.
 */

/** Where it is saved on the phone. */
export const VIEWED_KEY = 'quibo.viewed';

/** The most things kept: the newest. */
export const VIEWED_MOST = 8;

/** Puts `id` first. An id seen before moves to the front instead of being listed twice. */
export function viewItem(ids: readonly string[], id: string, most: number = VIEWED_MOST): string[] {
  return [id, ...ids.filter((entry) => entry !== id)].slice(0, most);
}

export function serializeViewed(ids: readonly string[]): string {
  return JSON.stringify(ids);
}

export function forgetItem(ids: readonly string[], id: string): string[] {
  return ids.filter((entry) => entry !== id);
}

/** What was saved, read defensively: anything unexpected is treated as nothing saved. */
export function parseViewed(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const ids = parsed.filter(
      (entry): entry is string => typeof entry === 'string' && entry !== '',
    );
    return [...new Set(ids)].slice(0, VIEWED_MOST);
  } catch {
    return [];
  }
}

/**
 * The items to show: each saved id that today's catalogue still holds, newest first. Something that is out of stock is left out,
 * because a row that says "continue" should lead to something that can be bought.
 */
export function viewedItems<T extends { id: string; stock?: { kind: 'out' | 'low' } | undefined }>(
  ids: readonly string[],
  items: readonly T[],
): T[] {
  const found: T[] = [];
  for (const id of ids) {
    const item = items.find((candidate) => candidate.id === id);
    if (item !== undefined && item.stock?.kind !== 'out') found.push(item);
  }
  return found;
}
