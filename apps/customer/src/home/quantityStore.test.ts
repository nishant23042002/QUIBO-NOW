import { describe, expect, it, vi } from 'vitest';
import { EXPECT_MS, createQuantityStore } from './quantityStore';

/** A store with a clock the test moves. */
function withClock() {
  let time = 0;
  const store = createQuantityStore(() => time);
  return {
    store,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

describe('the quantity store', () => {
  it('starts empty', () => {
    const { store } = withClock();
    expect(store.get('milk-500')).toBe(0);
    expect(store.count()).toBe(0);
    expect(store.hasItems()).toBe(false);
  });

  it('shows what a tap asked for at once, and tells its listeners', () => {
    const { store } = withClock();
    const listener = vi.fn();
    store.subscribe(listener);
    store.expect('milk-500', 2);
    expect(store.get('milk-500')).toBe(2);
    expect(store.hasItems()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps a tap showing while the cart has not caught up', () => {
    const { store } = withClock();
    store.expect('milk-500', 1);
    // An unrelated change settles the cart as it still is.
    store.settle({}, 0);
    expect(store.get('milk-500')).toBe(1);
  });

  it('drops the expectation once the cart lands on it, and says nothing more', () => {
    const { store } = withClock();
    const listener = vi.fn();
    store.expect('milk-500', 1);
    store.subscribe(listener);
    store.settle({ 'milk-500': 1 }, 1);
    expect(store.get('milk-500')).toBe(1);
    expect(store.count()).toBe(1);
    // The shown number did not change, only the count did.
    expect(listener).toHaveBeenCalledTimes(1);
    store.settle({ 'milk-500': 1, 'curd-400': 0 }, 1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('shows the cart own number once an expectation it never lands on has waited long enough', () => {
    const { store, advance } = withClock();
    store.expect('milk-500', 9);
    store.settle({ 'milk-500': 5 }, 1);
    expect(store.get('milk-500')).toBe(9);
    advance(EXPECT_MS + 1);
    store.settle({ 'milk-500': 5 }, 1);
    expect(store.get('milk-500')).toBe(5);
  });

  it('follows two quick taps to the number the cart settles on', () => {
    const { store } = withClock();
    store.expect('milk-500', 1);
    store.expect('milk-500', 2);
    store.settle({ 'milk-500': 1 }, 1);
    expect(store.get('milk-500')).toBe(2);
    store.settle({ 'milk-500': 2 }, 2);
    expect(store.get('milk-500')).toBe(2);
  });

  it('shows the cart as empty at once when the last item is taken out', () => {
    const { store } = withClock();
    store.settle({ 'milk-500': 1 }, 1);
    expect(store.hasItems()).toBe(true);
    store.expect('milk-500', 0);
    expect(store.hasItems()).toBe(false);
  });

  it('stops telling a listener that has gone', () => {
    const { store } = withClock();
    const listener = vi.fn();
    const stop = store.subscribe(listener);
    stop();
    store.expect('milk-500', 1);
    expect(listener).not.toHaveBeenCalled();
  });
});
