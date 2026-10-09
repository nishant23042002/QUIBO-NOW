import { capQuantity } from './packs';

/** What the phone is asked to remember about a cart: which packs, how many, and the order they were added in. */
const VERSION = 1;

/** What the catalogue says about a pack, so a saved cart can be checked against it. */
export interface PackLimit {
  /** False when the pack is out of stock. */
  available: boolean;
  /** The most that can be bought, when there is a stock limit. */
  maxQuantity?: number;
}

export interface RestoredCart {
  /** The pack ids in the order they were first added. */
  order: string[];
  quantities: Record<string, number>;
  /** How many saved packs were taken out because they no longer exist or are out of stock. */
  gone: number;
  /** How many saved packs were kept, but with fewer units because less is in stock now. */
  lowered: number;
}

const EMPTY: RestoredCart = { order: [], quantities: {}, gone: 0, lowered: 0 };

/** The cart as text for the phone's storage. Packs with nothing in them are left out. */
export function serialiseCart(
  order: readonly string[],
  quantities: Readonly<Record<string, number>>,
): string {
  const lines = order
    .map((packId) => [packId, quantities[packId] ?? 0] as const)
    .filter(([, quantity]) => quantity > 0);
  return JSON.stringify({ v: VERSION, lines });
}

function parseLines(raw: string): [string, number][] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const { v, lines } = parsed as { v?: unknown; lines?: unknown };
  if (v !== VERSION || !Array.isArray(lines)) return null;
  const result: [string, number][] = [];
  for (const line of lines as unknown[]) {
    if (!Array.isArray(line) || line.length !== 2) continue;
    const [packId, quantity] = line as [unknown, unknown];
    if (typeof packId !== 'string' || typeof quantity !== 'number') continue;
    if (!Number.isInteger(quantity) || quantity <= 0) continue;
    result.push([packId, quantity]);
  }
  return result;
}

/**
 * Reads a saved cart back and checks it against today's catalogue: a pack that no longer exists or is out of stock is
 * dropped, one with less stock than saved is lowered to what is there. Anything unreadable (nothing saved, a damaged
 * or older format) is an empty cart; it is never a crash.
 */
export function restoreCart(
  saved: string | null,
  limits: ReadonlyMap<string, PackLimit>,
  mostPerOrder: number,
): RestoredCart {
  if (saved === null) return EMPTY;
  const lines = parseLines(saved);
  if (lines === null) return EMPTY;

  const order: string[] = [];
  const quantities: Record<string, number> = {};
  let gone = 0;
  let lowered = 0;
  for (const [packId, quantity] of lines) {
    if (packId in quantities) continue;
    const limit = limits.get(packId);
    if (limit === undefined || !limit.available) {
      gone += 1;
      continue;
    }
    const allowed = capQuantity(quantity, limit.maxQuantity, mostPerOrder);
    if (allowed === 0) {
      gone += 1;
      continue;
    }
    if (allowed < quantity) lowered += 1;
    order.push(packId);
    quantities[packId] = allowed;
  }
  return { order, quantities, gone, lowered };
}
