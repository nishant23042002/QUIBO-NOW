import { describe, expect, it } from 'vitest';
import { NAV_STYLE, indicatorLeft, shownTab } from './navBar';

describe('shownTab', () => {
  it('lights the pressed tab at once, while the router still names the old one', () => {
    expect(shownTab('index', { key: 'cart', from: 'index' })).toBe('cart');
  });

  it('goes back to the router once it names anything else', () => {
    expect(shownTab('cart', { key: 'cart', from: 'index' })).toBe('cart');
    expect(shownTab('orders', { key: 'cart', from: 'index' })).toBe('orders');
  });

  it('follows the router when nothing was pressed', () => {
    expect(shownTab('categories', null)).toBe('categories');
  });
});

describe('indicatorLeft', () => {
  it('centres the line over each tab', () => {
    expect(indicatorLeft(0, 80, 28)).toBe(26);
    expect(indicatorLeft(2, 80, 28)).toBe(186);
  });

  it('moves by one tab width per tab', () => {
    expect(indicatorLeft(3, 90, 30) - indicatorLeft(2, 90, 30)).toBe(90);
  });
});

describe('NAV_STYLE', () => {
  it('names one of the two looks', () => {
    expect(['lively', 'classic']).toContain(NAV_STYLE);
  });
});
