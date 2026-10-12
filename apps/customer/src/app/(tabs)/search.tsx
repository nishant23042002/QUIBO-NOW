import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { SearchView } from '@/home/SearchView';

/**
 * The search screen. Opening it from Home passes a fresh `fresh` value, which empties the box and puts the
 * cursor in it; coming back to it from a shop or an item keeps what was typed.
 */
export default function SearchScreen() {
  const { fresh, q } = useLocalSearchParams<{ fresh?: string; q?: string }>();
  // A tile on the Categories tab opens search already holding its word.
  const [query, setQuery] = useState(q ?? '');
  const [seen, setSeen] = useState(fresh);
  const input = useRef<TextInput>(null);

  if (fresh !== seen) {
    setSeen(fresh);
    setQuery(q ?? '');
  }

  useEffect(() => {
    // With a word already in the box the results are the point, so the keyboard stays down.
    if (q !== undefined && q !== '') return undefined;
    // After the screen has slid in, so the keyboard does not fight the move.
    const timer = setTimeout(() => {
      input.current?.focus();
    }, 120);
    return () => {
      clearTimeout(timer);
    };
  }, [fresh, q]);

  return <SearchView query={query} onQueryChange={setQuery} inputRef={input} />;
}
