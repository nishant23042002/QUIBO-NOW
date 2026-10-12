import { describe, expect, it } from 'vitest';
import {
  NO_FILTERS,
  activeFilterCount,
  applyFilters,
  chosenIn,
  effectiveFilters,
  isOnOffer,
  savingOf,
  sortItems,
  toggleValue,
  type Browsable,
  type CategoryFilters,
} from './categoryFilters';

interface Sample extends Browsable {
  id: string;
  brand?: string;
  kind: string;
}

const item = (id: string, price: number, extra: Partial<Sample> = {}): Sample => ({
  id,
  kind: id,
  price,
  diet: { kind: 'veg' },
  ...extra,
});

const ITEMS: Sample[] = [
  item('milk', 2900, { mrp: 3000, brand: 'amul', kind: 'milk' }),
  item('curd', 3500, { brand: 'gokul' }),
  item('paneer', 9000, { mrp: 10000, brand: 'amul', stock: { kind: 'out' } }),
  item('eggs', 4800, { mrp: 5400, diet: { kind: 'nonveg' } }),
  item('cheap', 1000, { mrp: 1000, brand: 'parle' }),
];

const read = (entry: Sample, facet: string): string[] => {
  if (facet === 'brand') return entry.brand === undefined ? [] : [entry.brand];
  if (facet === 'type') return [entry.kind];
  return [];
};

const ids = (list: readonly Sample[]) => list.map((entry) => entry.id);
const only = (patch: Partial<CategoryFilters>): CategoryFilters => ({ ...NO_FILTERS, ...patch });

describe('offers and savings', () => {
  it('is on offer only when the price is below the full price', () => {
    expect(isOnOffer(ITEMS[0] as Sample)).toBe(true);
    expect(isOnOffer(ITEMS[1] as Sample)).toBe(false);
    expect(isOnOffer(ITEMS[4] as Sample)).toBe(false);
  });

  it('measures the saving in paise, zero when there is none', () => {
    expect(savingOf(ITEMS[0] as Sample)).toBe(100);
    expect(savingOf(ITEMS[3] as Sample)).toBe(600);
    expect(savingOf(ITEMS[1] as Sample)).toBe(0);
  });
});

describe('applyFilters', () => {
  it('keeps everything when nothing is on', () => {
    expect(ids(applyFilters(ITEMS, NO_FILTERS, read))).toEqual(ids(ITEMS));
  });

  it('narrows by the choices of a value filter, any of them passing', () => {
    expect(ids(applyFilters(ITEMS, only({ values: { brand: ['amul'] } }), read))).toEqual([
      'milk',
      'paneer',
    ]);
    expect(ids(applyFilters(ITEMS, only({ values: { brand: ['gokul', 'parle'] } }), read))).toEqual(
      ['curd', 'cheap'],
    );
    expect(ids(applyFilters(ITEMS, only({ values: { type: ['milk', 'eggs'] } }), read))).toEqual([
      'milk',
      'eggs',
    ]);
  });

  it('needs every filter that is on to pass, and ignores a filter with nothing chosen', () => {
    const filters = only({
      values: { brand: ['amul'], type: [] },
      maxPrice: 5000,
      offersOnly: true,
    });
    expect(ids(applyFilters(ITEMS, filters, read))).toEqual(['milk']);
  });

  it('narrows by price, food type and offers', () => {
    expect(ids(applyFilters(ITEMS, only({ maxPrice: 3000 }), read))).toEqual(['milk', 'cheap']);
    expect(ids(applyFilters(ITEMS, only({ diet: 'nonveg' }), read))).toEqual(['eggs']);
    expect(ids(applyFilters(ITEMS, only({ offersOnly: true }), read))).toEqual([
      'milk',
      'paneer',
      'eggs',
    ]);
  });

  it('leaves out an item with no value when a choice is made in that filter', () => {
    expect(
      ids(applyFilters(ITEMS, only({ values: { brand: ['amul', 'gokul', 'parle'] } }), read)),
    ).not.toContain('eggs');
  });
});

describe('sortItems', () => {
  it('keeps the given order for relevance, with sold out last', () => {
    expect(ids(sortItems(ITEMS, 'relevance'))).toEqual(['milk', 'curd', 'eggs', 'cheap', 'paneer']);
  });

  it('orders by price, low to high and high to low, sold out last', () => {
    expect(ids(sortItems(ITEMS, 'priceLow'))).toEqual(['cheap', 'milk', 'curd', 'eggs', 'paneer']);
    expect(ids(sortItems(ITEMS, 'priceHigh'))).toEqual(['eggs', 'curd', 'milk', 'cheap', 'paneer']);
  });

  it('puts the biggest saving first, and keeps the given order between equal savings', () => {
    expect(ids(sortItems(ITEMS, 'saving'))).toEqual(['eggs', 'milk', 'curd', 'cheap', 'paneer']);
  });

  it('does not change the list it is given', () => {
    const before = ids(ITEMS);
    sortItems(ITEMS, 'priceHigh');
    expect(ids(ITEMS)).toEqual(before);
  });
});

describe('the filters a list really has', () => {
  it('counts each filter that is narrowing once', () => {
    expect(activeFilterCount(NO_FILTERS)).toBe(0);
    expect(
      activeFilterCount({
        values: { brand: ['a', 'b'], type: ['t'], origin: [] },
        maxPrice: 5000,
        diet: 'veg',
        offersOnly: true,
      }),
    ).toBe(5);
  });

  it('toggles a value in a filter and counts the choices', () => {
    const one = toggleValue(NO_FILTERS, 'brand', 'amul');
    expect(chosenIn(one, 'brand')).toBe(1);
    const two = toggleValue(one, 'brand', 'gokul');
    expect(two.values['brand']).toEqual(['amul', 'gokul']);
    expect(toggleValue(two, 'brand', 'amul').values['brand']).toEqual(['gokul']);
    expect(chosenIn(NO_FILTERS, 'brand')).toBe(0);
  });

  it('drops a choice that is not in the list being shown', () => {
    const chosen = only({ values: { brand: ['amul', 'gokul'], type: ['milk'] } });
    const trimmed = effectiveFilters(chosen, { brand: ['amul', 'parle'], type: ['milk'] });
    expect(trimmed.values['brand']).toEqual(['amul']);
    expect(trimmed.values['type']).toEqual(['milk']);
    expect(effectiveFilters(chosen, { brand: ['amul', 'gokul'], type: ['milk'] })).toBe(chosen);
  });
});
