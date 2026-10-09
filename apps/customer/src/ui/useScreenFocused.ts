import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Whether the screen this is used on is the one in front. The tab screens stay mounted after they are left, so anything
 * that animates in a loop should only do so while this is true, and not spend the phone's battery behind the scenes.
 */
export function useScreenFocused(): boolean {
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
      };
    }, []),
  );

  return focused;
}
