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
    const tea = need('teaBreak');
    const items = [
      { id: 'namkeen', type: 'namkeen' },
      { id: 'milk', type: 'milk' },
      { id: 'tomato', type: 'tomato' },
      { id: 'biscuits', type: 'biscuits' },
    ];
    expect(tea && needItems(items, tea).map((item) => item.id)).toEqual([
      'milk',
      'biscuits',
      'namkeen',
    ]);
    expect(tea && needKinds(items, tea)).toEqual(['milk', 'biscuits', 'namkeen']);
  });

  it('leave out a need with nothing in stock, so its card is never an empty page', () => {
    expect(liveNeeds([{ id: 'x', type: 'tomato' }]).map((entry) => entry.id)).toEqual([
      'cookToday',
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
    const basics = need('cookToday');
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
    const movie = need('movieNight');
    expect(movie && needSections(items, movie)).toEqual([]);
  });

  it('name the first shelves of a need whatever is in stock', () => {
    const tea = need('teaBreak');
    expect(tea && needBlurb(tea)).toEqual([
      'catalogue.subs.milk',
      'catalogue.subs.sugar',
      'catalogue.subs.biscuits',
    ]);
    expect(tea && needBlurb(tea, 1)).toEqual(['catalogue.subs.milk']);
  });
});

describe('the moments as a page is built from them', () => {
  it('are the four launch moments, in the order Home lists them', () => {
    expect(NEEDS.map((entry) => entry.id)).toEqual([
      'teaBreak',
      'breakfast',
      'cookToday',
      'movieNight',
    ]);
  });

  it('hint only at kinds they gather, and never list a kind twice', () => {
    for (const entry of NEEDS) {
      expect(new Set(entry.kinds).size, entry.id).toBe(entry.kinds.length);
      for (const kind of Object.keys(entry.goes)) {
        expect(entry.kinds.includes(kind), `${entry.id}: hint for ${kind}`).toBe(true);
      }
    }
  });

  it('name a kind that is coming soon only where the town lacks it (cold drinks for Movie Night)', () => {
    expect(NEEDS.filter((entry) => entry.soon !== undefined).map((entry) => entry.id)).toEqual([
      'movieNight',
    ]);
  });

  it('lead with the kind the moment is about', () => {
    const first = Object.fromEntries(NEEDS.map((entry) => [entry.id, entry.kinds[0]]));
    expect(first).toEqual({
      teaBreak: 'milk',
      breakfast: 'bread',
      cookToday: 'atta',
      movieNight: 'popcorn',
    });
  });
});
