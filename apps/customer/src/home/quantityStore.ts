/**
 * What the cards on a screen need to know about the cart, kept apart from the cart's own state: how many of each pack, and how many
 * things are in it. A card reads one pack's number from here, so adding one item redraws that control and nothing else.
 *
 * The cart still does all the working out, and it does it at its own pace (it is told off the tap's critical path). A tap is shown here
 * at once as an *expectation*; the number the cart settles on confirms it, and the expectation is dropped. An expectation that the
 * cart never lands on (it refused, or was cut down) is dropped after `EXPECT_MS`, and the cart's number shows.
 */
export interface QuantityStore {
  /** How many of a pack are in the cart (what a tap has just asked for, until the cart has caught up). */
  get: (packId: string) => number;
  /** Whether anything is in the cart, counting what taps have just asked for. */
  hasItems: () => boolean;
  /** How many items are in the cart, as the cart last worked it out. */
  count: () => number;
  /** The cart has settled: everything in it, and how many items that is. Nothing is told if nothing a reader sees changed. */
  settle: (quantities: Readonly<Record<string, number>>, count: number) => void;
  /** A tap has asked for this many of one pack. It shows at once; `settle` confirms it or lets it go. */
  expect: (packId: string, quantity: number) => void;
  subscribe: (listener: () => void) => () => void;
}

/** How long a tap's expectation waits for the cart to land on it before the cart's own number is shown again. */
export const EXPECT_MS = 1500;

interface Expectation {
  value: number;
  at: number;
}

function same(a: Readonly<Record<string, number>>, b: Readonly<Record<string, number>>): boolean {
  const aKeys = Object.keys(a).filter((key) => (a[key] ?? 0) > 0);
  const bKeys = Object.keys(b).filter((key) => (b[key] ?? 0) > 0);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

export function createQuantityStore(now: () => number = Date.now): QuantityStore {
  let confirmed: Readonly<Record<string, number>> = {};
  let expected: Record<string, Expectation> = {};
  let count = 0;
  let shown: Readonly<Record<string, number>> = {};
  let items = false;
  const listeners = new Set<() => void>();

  /** What readers see: the cart's numbers, with the taps' expectations laid over them. */
  const merge = (): Record<string, number> => {
    const merged: Record<string, number> = { ...confirmed };
    for (const [packId, { value }] of Object.entries(expected)) merged[packId] = value;
    return merged;
  };

  /** Recompute what is shown, and tell the listeners only if a reader would see a difference. */
  const refresh = (nextCount: number) => {
    const merged = merge();
    const changed = !same(shown, merged) || nextCount !== count;
    shown = merged;
    count = nextCount;
    items = Object.values(merged).some((quantity) => quantity > 0);
    if (!changed) return;
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    get: (packId) => shown[packId] ?? 0,
    hasItems: () => items,
    count: () => count,
    settle: (next, nextCount) => {
      confirmed = next;
      const at = now();
      expected = Object.fromEntries(
        Object.entries(expected).filter(
          ([packId, { value, at: since }]) =>
            (next[packId] ?? 0) !== value && at - since <= EXPECT_MS,
        ),
      );
      refresh(nextCount);
    },
    expect: (packId, quantity) => {
      expected = { ...expected, [packId]: { value: quantity, at: now() } };
      refresh(count);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
