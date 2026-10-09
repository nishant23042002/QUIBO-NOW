import { describe, expect, it } from 'vitest';
import {
  CART_LINES_MAX,
  FIRST_CART_SHAPE,
  SAVED_MAX,
  cartShape,
  clampCount,
  couponCards,
  rememberCartShape,
  rememberedCartShape,
} from './skeletonShape';

describe('cartShape', () => {
  it('draws one line for each item, up to what fits the screen', () => {
    expect(cartShape({ lines: 3, saved: 0, shops: 1 }).lines).toBe(3);
    expect(cartShape({ lines: 12, saved: 0, shops: 1 }).lines).toBe(CART_LINES_MAX);
  });

  it('is the empty cart when there are no lines', () => {
    expect(cartShape({ lines: 0, saved: 0, shops: 0 })).toEqual({
      empty: true,
      lines: 0,
      saved: 0,
      trip: false,
    });
    expect(cartShape({ lines: 1, saved: 0, shops: 1 }).empty).toBe(false);
  });

  it('draws the saved list only when something is saved, and the trip note only for more than one shop', () => {
    expect(cartShape({ lines: 2, saved: 0, shops: 1 }).saved).toBe(0);
    expect(cartShape({ lines: 2, saved: 5, shops: 1 }).saved).toBe(SAVED_MAX);
    expect(cartShape({ lines: 2, saved: 1, shops: 1 }).trip).toBe(false);
    expect(cartShape({ lines: 2, saved: 1, shops: 2 }).trip).toBe(true);
  });
});

describe('the remembered shape', () => {
  it('starts as a small cart and is replaced by what was last seen', () => {
    expect(rememberedCartShape()).toEqual(FIRST_CART_SHAPE);
    const seen = cartShape({ lines: 4, saved: 1, shops: 2 });
    rememberCartShape(seen);
    expect(rememberedCartShape()).toBe(seen);
    rememberCartShape(FIRST_CART_SHAPE);
  });
});

describe('couponCards', () => {
  it('is one card for each offer, but always at least one and never more than fit', () => {
    expect(couponCards(0)).toBe(1);
    expect(couponCards(3)).toBe(3);
    expect(couponCards(30)).toBe(4);
  });
});

describe('clampCount', () => {
  it('keeps a count within bounds and whole', () => {
    expect(clampCount(-2, 0, 5)).toBe(0);
    expect(clampCount(2.9, 0, 5)).toBe(2);
    expect(clampCount(9, 0, 5)).toBe(5);
  });
});
