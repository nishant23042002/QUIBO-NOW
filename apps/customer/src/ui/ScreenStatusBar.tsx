import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { useTheme } from '@/theme';
import { useScreenFocused } from './useScreenFocused';

/**
 * The status bar text that reads on the header: dark on the lilac header of the light theme and light on the plum one of the dark
 * theme (ADR 0057).
 */
export function useHeaderStatusBarStyle(): StatusBarStyle {
  const { scheme } = useTheme();
  return scheme === 'light' ? 'dark' : 'light';
}

/**
 * The status bar for a screen that lives in the tabs. The tab screens stay mounted after they are left, and the
 * status bar that mounted last wins, so a plain `StatusBar` on a screen you have left could keep its text colour
 * on the screen you come back to (light text on a pale header, say). This one only exists while its screen is in
 * front, so coming back to a screen always brings its own colour back. `header` is the text colour that reads on the header.
 */
export function ScreenStatusBar({ style }: { style: StatusBarStyle | 'header' }) {
  const focused = useScreenFocused();
  const header = useHeaderStatusBarStyle();

  return focused ? <StatusBar style={style === 'header' ? header : style} /> : null;
}
