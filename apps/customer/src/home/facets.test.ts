import { describe, expect, it } from 'vitest';
import { MAIN_CATEGORIES } from './catalogueTree';
import { MAIN_FACETS, facetOptions, facetValues, labelAmount, type FacetSource } from './facets';

const milk: FacetSource = {
  type: 'milk',
  name: 'Toned milk',
  brand: { id: 'amul', name: 'Amul' },
  packs: [{ label: '500 ml' }, { label: '1 L' }],
};
const curd: FacetSource = {
  type: 'curd',
  name: 'Fresh curd',
  brand: { id: 'gokul', name: 'Gokul' },
  packs: [{ label: '400 g' }],
};
const tomato: FacetSource = { type: 'tomato', name: 'Tomato', packs: [{ label: '1 kg' }] };

describe('what an item has for a filter', () => {
  it('has a size for each pack', () => {
    expect(facetValues(milk, 'quantity')).toEqual(['500 ml', '1 L']);
  });

  it('names its brand, its kind and where it comes from', () => {
    expect(facetValues(milk, 'brand')).toEqual(['amul']);
    expect(facetValues(milk, 'type')).toEqual(['milk']);
    expect(facetValues(milk, 'origin')).toEqual(['local']);
    expect(facetValues({ ...tomato, type: 'chips' }, 'origin')).toEqual(['india']);
  });

  it('has the facts that belong to its kind, and nothing for a kind without them', () => {
    expect(facetValues(milk, 'fat')).toEqual(['toned']);
    expect(facetValues(milk, 'source')).toEqual(['cowMilk']);
    expect(facetValues(milk, 'processing')).toEqual(['pasteurized']);
    expect(facetValues(tomato, 'fat')).toEqual([]);
    expect(facetValues(tomato, 'brand')).toEqual([]);
  });
});

describe('the choices of a filter', () => {
  it('counts the items each choice has, in the order it first appears', () => {
    const options = facetOptions([milk, curd, milk], 'type');
    expect(options.map((option) => [option.id, option.count])).toEqual([
      ['milk', 2],
      ['curd', 1],
    ]);
  });

  it('puts sizes in order of how much they hold', () => {
    const options = facetOptions([milk, curd], 'quantity');
    expect(options.map((option) => option.id)).toEqual(['400 g', '500 ml', '1 L']);
  });

  it('keeps the first item that has a value, for naming it', () => {
    expect(facetOptions([curd, milk], 'brand')[1]?.sample.brand?.name).toBe('Amul');
  });
});

describe('reading a size', () => {
  it('turns a label into the smallest unit', () => {
    expect(labelAmount('500 ml')).toBe(500);
    expect(labelAmount('1 L')).toBe(1000);
    expect(labelAmount('2.5 kg')).toBe(2500);
    expect(labelAmount('6 pcs')).toBe(6);
    expect(labelAmount('1 dozen')).toBe(12);
    expect(labelAmount('loose')).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('the filters of each category', () => {
  it('has a list for every main category, with price in each', () => {
    for (const main of MAIN_CATEGORIES) {
      const list = MAIN_FACETS[main.id];
      expect(list.length, main.id).toBeGreaterThan(1);
      expect(list, main.id).toContain('price');
      expect(new Set(list).size, main.id).toBe(list.length);
    }
  });

  it('gives milk its fat profile and fruit its country of origin', () => {
    expect(MAIN_FACETS.dairyEggs).toContain('fat');
    expect(MAIN_FACETS.vegFruit).toContain('origin');
    expect(MAIN_FACETS.vegFruit[0]).toBe('type');
    expect(MAIN_FACETS.dairyEggs[0]).toBe('quantity');
  });
});
