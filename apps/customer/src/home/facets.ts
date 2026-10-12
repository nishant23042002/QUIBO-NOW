import type { MainCategoryId } from './catalogueTree';
import { ATTRIBUTES, ORIGIN } from './productAttributes';

/**
 * The filters a category screen offers. Each main category has its own, in its own order, the way a shopper expects them for what is
 * on the shelf: milk has a fat profile and a source, fruit has a country of origin, oil has a quantity and a price first.
 */
export type FacetId =
  | 'quantity'
  | 'brand'
  | 'type'
  | 'origin'
  | 'fat'
  | 'source'
  | 'processing'
  | 'price'
  | 'properties';

/** A filter whose choices are values an item has (as against price, which is a limit, and properties, which are switches). */
export type ValueFacet = Exclude<FacetId, 'price' | 'properties'>;

export const MAIN_FACETS: Readonly<Record<MainCategoryId, readonly FacetId[]>> = {
  vegFruit: ['type', 'price', 'origin', 'properties'],
  dairyEggs: ['quantity', 'brand', 'fat', 'type', 'source', 'processing', 'price'],
  attaRice: ['quantity', 'brand', 'type', 'properties', 'price'],
  oilMasala: ['quantity', 'price', 'brand', 'origin', 'type'],
  chips: ['quantity', 'brand', 'type', 'price', 'properties'],
  biscuits: ['quantity', 'brand', 'type', 'price', 'properties'],
  sweets: ['quantity', 'brand', 'type', 'price', 'properties'],
};

/** What a filter reads from an item. */
export interface FacetSource {
  type: string;
  name: string;
  brand?: { id: string; name: string } | undefined;
  packs: readonly { label: string }[];
}

export function isValueFacet(facet: FacetId): facet is ValueFacet {
  return facet !== 'price' && facet !== 'properties';
}

/** The values an item has for a filter: the ids that a choice in that filter can name. An item may have several (a size for each pack). */
export function facetValues(item: FacetSource, facet: ValueFacet): string[] {
  switch (facet) {
    case 'quantity':
      return item.packs.map((pack) => pack.label);
    case 'brand':
      return item.brand === undefined ? [] : [item.brand.id];
    case 'type':
      return [item.type];
    case 'origin':
      return [ORIGIN[item.type] ?? 'india'];
    case 'fat': {
      const value = ATTRIBUTES[item.type]?.fatProfile;
      return value === undefined ? [] : [value];
    }
    case 'source': {
      const value = ATTRIBUTES[item.type]?.biologicalSource;
      return value === undefined ? [] : [value];
    }
    case 'processing': {
      const value = ATTRIBUTES[item.type]?.processingType;
      return value === undefined ? [] : [value];
    }
  }
}

/** A size in its smallest unit, from a pack's label ("500 ml", "1 L", "2.5 kg", "6 pcs"), so sizes sort by how much they hold. */
export function labelAmount(label: string): number {
  const match = /^\s*([\d.]+)\s*([a-zA-Z]*)/.exec(label);
  if (match === null) return Number.POSITIVE_INFINITY;
  const number = Number(match[1]);
  if (!Number.isFinite(number)) return Number.POSITIVE_INFINITY;
  const unit = (match[2] ?? '').toLowerCase();
  if (unit === 'l' || unit === 'kg') return number * 1000;
  if (unit === 'dozen') return number * 12;
  return number;
}

export interface FacetOption {
  id: string;
  /** The first item that has this value, for the words that name it (a brand's name, a kind's name). */
  sample: FacetSource;
  count: number;
}

/**
 * The choices of a filter among some items, with how many items each has, in the order they first appear. Sizes are put in order of
 * how much they hold. A filter that has fewer than two choices is not worth showing, and the caller drops it.
 */
export function facetOptions<T extends FacetSource>(
  items: readonly T[],
  facet: ValueFacet,
): FacetOption[] {
  const found = new Map<string, FacetOption>();
  for (const item of items) {
    for (const id of facetValues(item, facet)) {
      const seen = found.get(id);
      if (seen === undefined) found.set(id, { id, sample: item, count: 1 });
      else seen.count += 1;
    }
  }
  const options = [...found.values()];
  return facet === 'quantity'
    ? options.sort((a, b) => labelAmount(a.id) - labelAmount(b.id))
    : options;
}
