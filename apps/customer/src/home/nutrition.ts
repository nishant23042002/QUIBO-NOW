/**
 * Approximate food values for the sample products, until the catalogue supplies the real ones from each pack's label
 * (Phase 1b and 2). The figures are per 100 g or 100 ml, round numbers from standard food tables; the page always
 * calls them approximate and points to the pack's label as the source.
 */

export interface Nutrients {
  /** Kilocalories. */
  kcal: number;
  /** Grams. */
  protein: number;
  carbs: number;
  fat: number;
}

/** A normal helping: how much, and what to call it when "250 ml" is not how a person would say it. */
export interface Serving {
  amount: number;
  unit: 'g' | 'ml';
  /** A name for the helping ("1 egg", "1 tablespoon"), used instead of the plain amount. */
  name?: 'egg' | 'banana' | 'apple' | 'tbsp' | 'tsp';
}

export interface NutritionFacts {
  per100: Nutrients;
  serving: Serving;
}

export const NUTRITION: Readonly<Record<string, NutritionFacts>> = {
  milk: {
    per100: { kcal: 58, protein: 3.1, carbs: 4.7, fat: 3 },
    serving: { amount: 250, unit: 'ml' },
  },
  curd: {
    per100: { kcal: 60, protein: 3.1, carbs: 4.4, fat: 3.3 },
    serving: { amount: 100, unit: 'g' },
  },
  paneer: {
    per100: { kcal: 265, protein: 18.3, carbs: 1.2, fat: 20.8 },
    serving: { amount: 50, unit: 'g' },
  },
  eggs: {
    per100: { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
    serving: { amount: 50, unit: 'g', name: 'egg' },
  },
  tomato: {
    per100: { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    serving: { amount: 100, unit: 'g' },
  },
  potato: {
    per100: { kcal: 77, protein: 2, carbs: 17, fat: 0.1 },
    serving: { amount: 100, unit: 'g' },
  },
  carrot: {
    per100: { kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
    serving: { amount: 100, unit: 'g' },
  },
  brinjal: {
    per100: { kcal: 25, protein: 1, carbs: 5.9, fat: 0.2 },
    serving: { amount: 100, unit: 'g' },
  },
  banana: {
    per100: { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
    serving: { amount: 100, unit: 'g', name: 'banana' },
  },
  apple: {
    per100: { kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2 },
    serving: { amount: 150, unit: 'g', name: 'apple' },
  },
  orange: {
    per100: { kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1 },
    serving: { amount: 100, unit: 'g' },
  },
  grapes: {
    per100: { kcal: 69, protein: 0.7, carbs: 18, fat: 0.2 },
    serving: { amount: 100, unit: 'g' },
  },
  atta: {
    per100: { kcal: 340, protein: 12, carbs: 71, fat: 1.7 },
    serving: { amount: 30, unit: 'g' },
  },
  rice: {
    per100: { kcal: 360, protein: 6.8, carbs: 79, fat: 0.5 },
    serving: { amount: 50, unit: 'g' },
  },
  oil: {
    per100: { kcal: 900, protein: 0, carbs: 0, fat: 100 },
    serving: { amount: 15, unit: 'ml', name: 'tbsp' },
  },
  sugar: {
    per100: { kcal: 400, protein: 0, carbs: 100, fat: 0 },
    serving: { amount: 5, unit: 'g', name: 'tsp' },
  },
  biscuits: {
    per100: { kcal: 450, protein: 7, carbs: 75, fat: 14 },
    serving: { amount: 25, unit: 'g' },
  },
  chips: {
    per100: { kcal: 540, protein: 6, carbs: 53, fat: 34 },
    serving: { amount: 30, unit: 'g' },
  },
  popcorn: {
    per100: { kcal: 480, protein: 9, carbs: 60, fat: 22 },
    serving: { amount: 30, unit: 'g' },
  },
  chocolate: {
    per100: { kcal: 535, protein: 7.6, carbs: 59, fat: 30 },
    serving: { amount: 25, unit: 'g' },
  },
};

const tenth = (value: number): number => Math.round(value * 10) / 10;

/** What a helping of this size holds: kilocalories as a whole number, the rest to one decimal place. */
export function perServing(per100: Nutrients, amount: number): Nutrients {
  const share = amount / 100;
  return {
    kcal: Math.round(per100.kcal * share),
    protein: tenth(per100.protein * share),
    carbs: tenth(per100.carbs * share),
    fat: tenth(per100.fat * share),
  };
}

/**
 * How long each of the three bars is, from 0 to 1: the biggest of the three fills its bar, the others are in proportion.
 * A figure above zero never gets a bar too short to see, and a figure of zero gets none.
 */
export function macroShares(helping: Pick<Nutrients, 'protein' | 'carbs' | 'fat'>): {
  protein: number;
  carbs: number;
  fat: number;
} {
  const biggest = Math.max(helping.protein, helping.carbs, helping.fat);
  const share = (value: number) =>
    value <= 0 || biggest <= 0 ? 0 : Math.max(value / biggest, 0.06);
  return { protein: share(helping.protein), carbs: share(helping.carbs), fat: share(helping.fat) };
}

/** A figure for display with Latin digits and no trailing ".0": 8, 0.4, 7.5. */
export function formatNutrient(value: number): string {
  return String(tenth(value));
}
