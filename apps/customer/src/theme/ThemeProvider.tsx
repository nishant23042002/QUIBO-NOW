import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, StyleSheet, useColorScheme } from 'react-native';
import { parseMode, resolveScheme, toggledMode, type Mode } from './mode';
import { palettes, type Scheme, type ThemeColors } from './palette';
import { readSetting, writeSetting } from '@/storage';

const THEME_KEY = 'quibo.theme';

export interface Theme {
  mode: Mode;
  /** The theme being drawn: light or dark. */
  scheme: Scheme;
  colors: ThemeColors;
  /** False until the stored choice has been read, so the app can wait instead of flashing. */
  ready: boolean;
  /** Switch to the other theme and remember it. */
  toggle: () => void;
}

const ThemeContext = createContext<Theme | null>(null);

/**
 * Holds the theme for the whole app. It starts from the phone's light or dark setting, and the
 * toggle overrides that and is remembered. Every colour on screen comes from here.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<Mode>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let current = true;
    void readSetting(THEME_KEY).then((stored) => {
      if (!current) return;
      setMode(parseMode(stored));
      setReady(true);
    });
    return () => {
      current = false;
    };
  }, []);

  // Let the phone's own pieces (keyboard, system dialogs) follow an explicit choice as well.
  useEffect(() => {
    try {
      Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
    } catch {
      // Not supported on this platform, which only means those pieces keep the phone's setting.
    }
  }, [mode]);

  const scheme = resolveScheme(mode, system);

  const toggle = useCallback(() => {
    const next = toggledMode(scheme);
    setMode(next);
    void writeSetting(THEME_KEY, next);
  }, [scheme]);

  const value = useMemo<Theme>(
    () => ({ mode, scheme, colors: palettes[scheme], ready, toggle }),
    [mode, scheme, ready, toggle],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (theme === null) throw new Error('useTheme needs a <ThemeProvider> above it.');
  return theme;
}

/**
 * Styles that follow the theme. Pass a function defined outside the component, so the styles are
 * rebuilt only when the theme changes: `const makeStyles = (c: ThemeColors) => ({ ... })`.
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  make: (colors: ThemeColors) => T,
): T {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(make(colors)), [make, colors]);
}
