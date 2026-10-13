import { describe, expect, it } from 'vitest';
import { MAIN_CATEGORIES } from './catalogueTree';
import { NEEDS, liveNeeds, need, needBlurb, needItems, needKinds, needSections } from './needs';

/** One item of every kind the catalogue holds. */
const stocked = MAIN_CATEGORIES.flatMap((main) => main.subs.flatMap((sub) => sub.types)).map(
  (type) => ({ id: type, type }),
);

describe('the needs', () => {
  it('have unique ids and gather only kinds the catalogue holds', () => {
    expect(new Set(NEEDS.map((entry) => entry.id)).size).toBe(NEEDS.length);
    const kinds = new Set(stocked.map((item) => item.type));
    for (const entry of NEEDS) {
      expect(entry.kinds.length).toBeGreaterThan(0);
      for (const kind of entry.kinds) expect(kinds.has(kind), `${entry.id}: ${kind}`).toBe(true);
    }
  });

  it('list their items in the order of their kinds', () => {
    const tea = need('teaTime');
    const items = [
      { id: 'chips', type: 'chips' },
      { id: 'milk', type: 'milk' },
      { id: 'tomato', type: 'tomato' },
      { id: 'biscuits', type: 'biscuits' },
    ];
    expect(tea && needItems(items, tea).map((item) => item.id)).toEqual([
      'milk',
      'biscuits',
      'chips',
    ]);
    expect(tea && needKinds(items, tea)).toEqual(['milk', 'biscuits', 'chips']);
  });

  it('leave out a need with nothing in stock, so its card is never an empty page', () => {
    expect(liveNeeds([{ id: 'x', type: 'tomato' }]).map((entry) => entry.id)).toEqual([
      'cookingBasics',
    ]);
    expect(liveNeeds([])).toEqual([]);
    expect(need('nope')).toBeUndefined();
  });

  it('are all live when everything is stocked', () => {
    expect(liveNeeds(stocked).length).toBe(NEEDS.length);
  });
});

describe('the shelves of a need', () => {
  const items = [
    { id: 'tomato', type: 'tomato' },
    { id: 'milk', type: 'milk' },
    { id: 'potato', type: 'potato' },
    { id: 'milk2', type: 'milk' },
    { id: 'rice', type: 'rice' },
  ];

  it('group kinds by the sub-category they sit in, in the order the need lists them', () => {
    const basics = need('cookingBasics');
    const sections = basics ? needSections(items, basics) : [];
    // rice (Rice), then tomato and potato together (Fresh Vegetables): atta, oil and sugar have no items so they are left out.
    expect(sections.map((section) => section.id)).toEqual(['rice', 'freshVegetables']);
    expect(sections[1]?.items.map((item) => item.id)).toEqual(['tomato', 'potato']);
  });

  it('keep every brand of a kind in its shelf', () => {
    const breakfast = need('breakfast');
    const sections = breakfast ? needSections(items, breakfast) : [];
    expect(sections.map((section) => section.id)).toEqual(['milk']);
    expect(sections[0]?.items.map((item) => item.id)).toEqual(['milk', 'milk2']);
  });

  it('are empty for a need with nothing in stock', () => {
    const party = need('partySnacks');
    expect(party && needSections(items, party)).toEqual([]);
  });

  it('name the first shelves of a need whatever is in stock', () => {
    const tea = need('teaTime');
    expect(tea && needBlurb(tea)).toEqual([
      'catalogue.subs.milk',
      'catalogue.subs.sugar',
      'catalogue.subs.biscuits',
    ]);
    expect(tea && needBlurb(tea, 1)).toEqual(['catalogue.subs.milk']);
  });
});
