/**
 * What the cards on a screen need to know about the cart, kept apart from the cart's own state: how many of each pack, and how many
 * things are in it. A card reads one pack's number from here, so adding one item redraws that card and nothing else. The cart still
 * does all the working out; this only holds the numbers it has settled on (and the number a tap has just asked for, until the cart has
 * caught up).
 */
export interface QuantityStore {
  /** How many of a pack are in the cart. */
  get: (packId: string) => number;
  /** How many items are in the cart. */
  count: () => number;
  /** The cart has settled: everything in it, and how many items that is. Nothing is told if nothing changed. */
  settle: (quantities: Readonly<Record<string, number>>, count: number) => void;
  /** A tap has asked for this many of one pack. It shows at once; `settle` confirms or corrects it. */
  expect: (packId: string, quantity: number) => void;
  subscribe: (listener: () => void) => () => void;
}

function sameQuantities(
  a: Readonly<Record<string, number>>,
  b: Readonly<Record<string, number>>,
): boolean {
  const aKeys = Object.keys(a).filter((key) => (a[key] ?? 0) > 0);
  const bKeys = Object.keys(b).filter((key) => (b[key] ?? 0) > 0);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

export function createQuantityStore(): QuantityStore {
  let quantities: Readonly<Record<string, number>> = {};
  let count = 0;
  const listeners = new Set<() => void>();
  const tell = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    get: (packId) => quantities[packId] ?? 0,
    count: () => count,
    settle: (next, nextCount) => {
      if (sameQuantities(quantities, next) && count === nextCount) return;
      quantities = next;
      count = nextCount;
      tell();
    },
    expect: (packId, quantity) => {
      if ((quantities[packId] ?? 0) === quantity) return;
      quantities = { ...quantities, [packId]: quantity };
      tell();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
