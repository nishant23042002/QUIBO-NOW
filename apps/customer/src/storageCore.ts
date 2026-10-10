/** The two calls the app needs from whatever keeps settings on the phone. */
export interface Backend {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

export interface Storage {
  /** The saved text, or null when nothing is saved, or when reading failed (see `writeSetting`). */
  readSetting: (key: string) => Promise<string | null>;
  /** Saves text. Does nothing for a key whose last read failed. */
  writeSetting: (key: string, value: string) => Promise<void>;
}

/**
 * Settings that survive a restart: the theme, the language, the cart, the orders and the rest. Storage can fail (a full disk, a
 * private browser window), and a missing setting is never worth a crash, so both calls swallow errors: a failed read looks like
 * "nothing stored" and a failed write just means it is not kept.
 *
 * One rule keeps that from losing anything: a key whose read failed is not written to afterwards. A screen that read nothing
 * because storage was broken, not because nothing was saved, would otherwise save its empty state and replace what was there. The
 * key becomes writable again when a later read of it succeeds, which a restart does.
 */
export function createStorage(backend: Backend): Storage {
  const unreadable = new Set<string>();

  return {
    readSetting: async (key) => {
      try {
        const value = await backend.getItem(key);
        unreadable.delete(key);
        return value;
      } catch {
        unreadable.add(key);
        return null;
      }
    },
    writeSetting: async (key, value) => {
      if (unreadable.has(key)) return;
      try {
        await backend.setItem(key, value);
      } catch {
        // Not kept this time. The app keeps working with the value in memory.
      }
    },
  };
}
