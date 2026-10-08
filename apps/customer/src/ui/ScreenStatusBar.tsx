import { useFocusEffect } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';

/**
 * The status bar for a screen that lives in the tabs. The tab screens stay mounted after they are left, and the
 * status bar that mounted last wins, so a plain `StatusBar` on a screen you have left could keep its text colour
 * on the screen you come back to (light text on a pale header, say). This one only exists while its screen is in
 * front, so coming back to a screen always brings its own colour back.
 */
export function ScreenStatusBar({ style }: { style: StatusBarStyle }) {
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
      };
    }, []),
  );

  return focused ? <StatusBar style={style} /> : null;
}
