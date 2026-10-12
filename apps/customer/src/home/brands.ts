/**
 * Brands of the sample items, until the catalogue supplies them (Phase 1b). A brand is a name people trust (ADR 0036); loose
 * produce and a shop's own goods have none, so they are simply absent from `BRAND_OF`. Names live in the message files, in
 * English, Hindi and Marathi, under `brands.<id>`; the mark is the monogram shown until there is a logo (and no logo is added
 * before the trademark question in ADR 0036 is settled).
 */
export const BRAND_IDS = [
  'amul',
  'gokul',
  'katraj',
  'chitale',
  'aashirvaad',
  'indiaGate',
  'fortune',
  'parle',
  'lays',
  'dairyMilk',
  'kitKat',
  'britannia',
] as const;

export type BrandId = (typeof BRAND_IDS)[number];

/** The letter drawn on a brand's tile. The same in every language, as a brand's own mark is. */
export const BRAND_MARK: Readonly<Record<BrandId, string>> = {
  amul: 'A',
  gokul: 'G',
  katraj: 'K',
  chitale: 'C',
  aashirvaad: 'A',
  indiaGate: 'I',
  fortune: 'F',
  parle: 'P',
  lays: 'L',
  dairyMilk: 'D',
  kitKat: 'K',
  britannia: 'B',
};

/** Which brand each sample item carries. An item that is missing here has no brand. */
export const BRAND_OF: Readonly<Record<string, BrandId | undefined>> = {
  milk: 'amul',
  curd: 'gokul',
  paneer: 'amul',
  atta: 'aashirvaad',
  rice: 'indiaGate',
  oil: 'fortune',
  biscuits: 'parle',
  chips: 'lays',
  chocolate: 'dairyMilk',
  milkGokul: 'gokul',
  milkKatraj: 'katraj',
  milkChitale: 'chitale',
  curdAmul: 'amul',
  chocolateKitkat: 'kitKat',
  biscuitsBritannia: 'britannia',
};

/**
 * The plain kind of product an item is, for the items whose id is not already that ("milk" is the type of every toned milk).
 * Items under different brands with the same type are each other's "other brands".
 */
export const TYPE_OF: Readonly<Record<string, string | undefined>> = {
  milkGokul: 'milk',
  milkKatraj: 'milk',
  milkChitale: 'milk',
  curdAmul: 'curd',
  chocolateKitkat: 'chocolate',
  biscuitsBritannia: 'biscuits',
};

/**
 * How many other shops also stock an item, until the shops' own catalogues supply it (Phase 2). The product page says so on its
 * "Sold by" row; which shop is shown first when several have it is an open question (ADR 0036).
 */
export const OTHER_SHOPS: Readonly<Record<string, number | undefined>> = {
  milk: 2,
  curd: 1,
  atta: 1,
  oil: 1,
  biscuits: 1,
};
