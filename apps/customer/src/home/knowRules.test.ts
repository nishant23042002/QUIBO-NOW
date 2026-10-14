import { describe, expect, it } from 'vitest';
import { KNOW_QUESTIONS, KNOW_ROWS_COLLAPSED, KNOW_SCORE, knowShown } from './knowRules';

describe('knowShown', () => {
  it('is shown where partner shops serve the town', () => {
    expect(knowShown('partner')).toBe(true);
  });

  it('is not shown when the town is served by one dark store', () => {
    expect(knowShown('dark')).toBe(false);
  });
});

describe('the five questions and the score', () => {
  it('asks five things, once each', () => {
    expect(KNOW_QUESTIONS).toHaveLength(5);
    expect(new Set(KNOW_QUESTIONS).size).toBe(5);
  });

  it('keeps at least one row to open', () => {
    expect(KNOW_ROWS_COLLAPSED).toBeGreaterThan(0);
    expect(KNOW_ROWS_COLLAPSED).toBeLessThan(KNOW_QUESTIONS.length);
  });

  it('scores 0 of the questions for a dark store and all of them for a shop', () => {
    expect(KNOW_SCORE.darkStore).toBe(0);
    expect(KNOW_SCORE.shop).toBe(KNOW_QUESTIONS.length);
  });
});
