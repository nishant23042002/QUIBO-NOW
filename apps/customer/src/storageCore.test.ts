import { describe, expect, it } from 'vitest';
import { createStorage, type Backend } from './storageCore';

/** A backend that keeps text in memory and can be told to fail. */
function fake(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const state = { failReads: false, failWrites: false };
  const backend: Backend = {
    getItem: (key) => {
      if (state.failReads) return Promise.reject(new Error('read failed'));
      return Promise.resolve(data.get(key) ?? null);
    },
    setItem: (key, value) => {
      if (state.failWrites) return Promise.reject(new Error('write failed'));
      data.set(key, value);
      return Promise.resolve();
    },
  };
  return { backend, data, state };
}

describe('createStorage', () => {
  it('reads what was saved, and nothing for a key that was never saved', async () => {
    const { backend } = fake({ cart: 'two things' });
    const storage = createStorage(backend);
    expect(await storage.readSetting('cart')).toBe('two things');
    expect(await storage.readSetting('orders')).toBeNull();
  });

  it('writes, and what it wrote reads back', async () => {
    const { backend } = fake();
    const storage = createStorage(backend);
    await storage.writeSetting('cart', 'milk');
    expect(await storage.readSetting('cart')).toBe('milk');
  });

  it('does not throw when reading or writing fails', async () => {
    const { backend, state } = fake({ cart: 'milk' });
    const storage = createStorage(backend);
    state.failReads = true;
    await expect(storage.readSetting('cart')).resolves.toBeNull();
    state.failReads = false;
    state.failWrites = true;
    await expect(storage.writeSetting('orders', 'x')).resolves.toBeUndefined();
  });

  it('does not write over what is saved after the read of that key failed', async () => {
    const { backend, data, state } = fake({ orders: 'three orders' });
    const storage = createStorage(backend);
    state.failReads = true;
    expect(await storage.readSetting('orders')).toBeNull();
    state.failReads = false;
    // The screen, thinking there was nothing, saves its empty state: it must not land.
    await storage.writeSetting('orders', '{"v":1,"orders":[]}');
    expect(data.get('orders')).toBe('three orders');
  });

  it('only holds back the key that failed', async () => {
    const { backend, data, state } = fake({ orders: 'three orders', cart: 'milk' });
    const storage = createStorage(backend);
    state.failReads = true;
    await storage.readSetting('orders');
    state.failReads = false;
    await storage.writeSetting('cart', 'milk and eggs');
    expect(data.get('cart')).toBe('milk and eggs');
  });

  it('writes again once a later read of the key succeeds', async () => {
    const { backend, data, state } = fake({ orders: 'three orders' });
    const storage = createStorage(backend);
    state.failReads = true;
    await storage.readSetting('orders');
    state.failReads = false;
    expect(await storage.readSetting('orders')).toBe('three orders');
    await storage.writeSetting('orders', 'four orders');
    expect(data.get('orders')).toBe('four orders');
  });

  it('lets a key that was never read be written, as the first run does', async () => {
    const { backend, data } = fake();
    const storage = createStorage(backend);
    await storage.writeSetting('language', 'hi');
    expect(data.get('language')).toBe('hi');
  });
});
