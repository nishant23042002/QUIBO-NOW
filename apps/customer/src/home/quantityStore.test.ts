import { describe, expect, it, vi } from 'vitest';
import { createQuantityStore } from './quantityStore';

describe('the quantity store', () => {
  it('starts empty', () => {
    const store = createQuantityStore();
    expect(store.get('milk-500')).toBe(0);
    expect(store.count()).toBe(0);
  });

  it('shows what a tap asked for at once, and tells its listeners', () => {
    const store = createQuantityStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.expect('milk-500', 2);
    expect(store.get('milk-500')).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('is not told again for a value it already shows', () => {
    const store = createQuantityStore();
    const listener = vi.fn();
    store.settle({ 'milk-500': 1 }, 1);
    store.subscribe(listener);
    store.expect('milk-500', 1);
    store.settle({ 'milk-500': 1 }, 1);
    store.settle({ 'milk-500': 1, 'curd-400': 0 }, 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('is corrected by the cart when it settles on something else', () => {
    const store = createQuantityStore();
    store.expect('milk-500', 9);
    store.settle({ 'milk-500': 5 }, 1);
    expect(store.get('milk-500')).toBe(5);
    expect(store.count()).toBe(1);
  });

  it('stops telling a listener that has gone', () => {
    const store = createQuantityStore();
    const listener = vi.fn();
    const stop = store.subscribe(listener);
    stop();
    store.expect('milk-500', 1);
    expect(listener).not.toHaveBeenCalled();
  });
});
