/**
 * Pack sizes, in plain numbers (paise for prices) so they are easy to test. A product can be sold in several packs,
 * for example milk in 500 ml and 1 L: each pack has its own price and its own stock, and is its own line in the cart.
 */

export type Unit = 'ml' | 'l' | 'g' | 'kg' | 'pcs' | 'dozen' | 'pack';

export interface PackSize {
  amount: number;
  unit: Unit;
}

/** What a price is compared per: litre, kilogram or piece. */
export type UnitKind = 'l' | 'kg' | 'pc';

/** How many of the smallest unit a pack holds (millilitres, grams, pieces), so packs can be ordered and compared. */
export function baseAmount({ amount, unit }: PackSize): number {
  switch (unit) {
    case 'l':
    case 'kg':
      return amount * 1000;
    case 'dozen':
      return amount * 12;
    default:
      return amount;
  }
}

function kindOf(unit: Unit): UnitKind | undefined {
  switch (unit) {
    case 'ml':
    case 'l':
      return 'l';
    case 'g':
    case 'kg':
      return 'kg';
    case 'pcs':
    case 'dozen':
      return 'pc';
    default:
      // A "pack" has no size to compare by.
      return undefined;
  }
}

/** The price of one litre, one kilogram or one piece of a pack, in whole paise. Packs without a size give nothing. */
export function unitPrice(
  price: number,
  size: PackSize,
): { kind: UnitKind; paise: number } | undefined {
  const kind = kindOf(size.unit);
  if (kind === undefined) return undefined;
  const base = baseAmount(size);
  if (base <= 0) return undefined;
  const perBase = price / base;
  // Litres and kilograms are counted in thousands of the base unit; pieces are counted one by one.
  return { kind, paise: Math.round(kind === 'pc' ? perBase : perBase * 1000) };
}

/**
 * Which pack is the best value: the one with the lowest price per litre, kilogram or piece, when there are at
 * least two packs that can be compared and one is strictly cheapest. Packs that are out of stock do not count.
 */
export function bestValueIndex(
  packs: readonly { price: number; size: PackSize; available: boolean }[],
): number | undefined {
  const priced = packs
    .map((pack, index) => ({
      index,
      unit: pack.available ? unitPrice(pack.price, pack.size) : undefined,
    }))
    .filter((entry) => entry.unit !== undefined);
  if (priced.length < 2) return undefined;
  const kind = priced[0]?.unit?.kind;
  if (priced.some((entry) => entry.unit?.kind !== kind)) return undefined;
  const cheapest = Math.min(...priced.map((entry) => entry.unit?.paise ?? Infinity));
  const winners = priced.filter((entry) => entry.unit?.paise === cheapest);
  return winners.length === 1 ? winners[0]?.index : undefined;
}

/** The pack shown first on a card: the first one that can be bought, or the first one when none can. */
export function defaultPackIndex(packs: readonly { available: boolean }[]): number {
  const found = packs.findIndex((pack) => pack.available);
  return found === -1 ? 0 : found;
}
