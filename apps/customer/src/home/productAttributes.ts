/**
 * Where a product comes from and the facts that tell one product of a kind from another. Held by kind of product and apart from the
 * product page's text, so the page and the category screen's filters read the same facts.
 */

/** Where each product comes from, until the catalogue supplies it (Phase 1b). */
export const ORIGIN: Readonly<Record<string, 'india' | 'maharashtra' | 'local'>> = {
  milk: 'local',
  curd: 'local',
  paneer: 'local',
  eggs: 'local',
  tomato: 'local',
  potato: 'local',
  carrot: 'local',
  brinjal: 'local',
  banana: 'maharashtra',
  orange: 'maharashtra',
  grapes: 'maharashtra',
  apple: 'india',
};

/**
 * The facts that tell one product of a kind from another, named the way shoppers see them named elsewhere (Fat Profile, Shelf Life,
 * Biological Source, Processing Type), until the catalogue supplies them (Phase 1b). Only kinds that have such facts are listed;
 * the others fall back to Product Type and Dietary Preference.
 */
export type AttrLabel = 'fatProfile' | 'biologicalSource' | 'processingType' | 'sugarProfile';
export type AttrValue =
  'toned' | 'fullCream' | 'cowMilk' | 'buffaloMilk' | 'hen' | 'pasteurized' | 'noAddedSugar';
export const ATTRIBUTES: Readonly<Record<string, Partial<Record<AttrLabel, AttrValue>>>> = {
  milk: {
    fatProfile: 'toned',
    biologicalSource: 'cowMilk',
    processingType: 'pasteurized',
    sugarProfile: 'noAddedSugar',
  },
  curd: { fatProfile: 'toned', biologicalSource: 'cowMilk', processingType: 'pasteurized' },
  paneer: { fatProfile: 'fullCream', biologicalSource: 'cowMilk', processingType: 'pasteurized' },
  eggs: { biologicalSource: 'hen' },
};
