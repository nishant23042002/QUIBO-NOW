import { useCallback, useEffect, useRef, useState } from 'react';
import { readSetting, writeSetting } from '@/storage';
import { addRecent, parseRecent } from './search';

const RECENT_KEY = 'quibo.recent-searches';

export interface RecentSearches {
  /** Newest first. */
  recent: readonly string[];
  /** Remembers a search that led somewhere (a result was opened, or the keyboard's search key was pressed). */
  remember: (term: string) => void;
  clear: () => void;
}

/** The last few things searched for, kept on the phone so they are there next time. */
export function useRecentSearches(): RecentSearches {
  const [recent, setRecent] = useState<readonly string[]>([]);
  // The latest list, so two searches remembered in a row cannot overwrite each other.
  const latest = useRef<readonly string[]>([]);

  useEffect(() => {
    let live = true;
    void readSetting(RECENT_KEY).then((saved) => {
      if (!live) return;
      latest.current = parseRecent(saved);
      setRecent(latest.current);
    });
    return () => {
      live = false;
    };
  }, []);

  const remember = useCallback((term: string) => {
    latest.current = addRecent(latest.current, term);
    setRecent(latest.current);
    void writeSetting(RECENT_KEY, JSON.stringify(latest.current));
  }, []);

  const clear = useCallback(() => {
    latest.current = [];
    setRecent([]);
    void writeSetting(RECENT_KEY, '[]');
  }, []);

  return { recent, remember, clear };
}
