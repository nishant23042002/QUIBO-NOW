import { describe, expect, it } from 'vitest';
import { NUTRITION, formatNutrient, perServing } from './nutrition';

describe('perServing', () => {
  it('scales the per-100 figures to the helping, kilocalories whole and the rest to one decimal', () => {
    const milk = NUTRITION.milk;
    expect(milk && perServing(milk.per100, 250)).toEqual({
      kcal: 145,
      protein: 7.8,
      carbs: 11.8,
      fat: 7.5,
    });
    const sugar = NUTRITION.sugar;
    expect(sugar && perServing(sugar.per100, 5)).toEqual({
      kcal: 20,
      protein: 0,
      carbs: 5,
      fat: 0,
    });
  });

  it('is the same figures for exactly 100', () => {
    const tomato = NUTRITION.tomato;
    expect(tomato && perServing(tomato.per100, 100)).toEqual(tomato?.per100);
  });
});

describe('formatNutrient', () => {
  it('drops a trailing .0 and keeps one decimal otherwise', () => {
    expect(formatNutrient(8)).toBe('8');
    expect(formatNutrient(8.04)).toBe('8');
    expect(formatNutrient(7.8)).toBe('7.8');
    expect(formatNutrient(0.4)).toBe('0.4');
  });
});

describe('the sample figures', () => {
  it('cover every sample product', () => {
    for (const id of [
      'milk',
      'curd',
      'paneer',
      'eggs',
      'tomato',
      'potato',
      'carrot',
      'brinjal',
      'banana',
      'apple',
      'orange',
      'grapes',
      'atta',
      'rice',
      'oil',
      'sugar',
      'biscuits',
      'chips',
      'popcorn',
      'chocolate',
    ]) {
      expect(NUTRITION[id], id).toBeDefined();
    }
  });

  it('add up: energy is close to 4 x protein + 4 x carbs + 9 x fat, which catches a mistyped figure', () => {
    for (const [id, facts] of Object.entries(NUTRITION)) {
      const { kcal, protein, carbs, fat } = facts.per100;
      const worked = 4 * protein + 4 * carbs + 9 * fat;
      // Fibre, water and rounding make food tables differ a little from the sum.
      expect(Math.abs(kcal - worked) / kcal, id).toBeLessThan(0.25);
    }
  });
});
