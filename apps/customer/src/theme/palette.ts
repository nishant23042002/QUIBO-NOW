/*
 * The Quibo Now palette: Aubergine and Pistachio in the light theme, and a black and graphite dark theme
 * that keeps Aubergine for the header and bars, and Pistachio as the accent. This is the only file
 * that may contain a colour value (lint enforces it); everything else reads colours from useTheme().
 * Every text and control pairing below is checked in palette.test.ts: 4.5:1 for text, 3:1 for the
 * edge of a control.
 */

export type Scheme = 'light' | 'dark';

export interface ThemeColors {
  /** The page behind everything. */
  bg: string;
  /** Cards, inputs and sheets. */
  surface: string;
  /** A tinted block: placeholders, tab bars, disabled fills. */
  muted: string;
  /** Body text. */
  ink: string;
  /** Captions and hints. */
  inkMuted: string;
  /** Decorative borders and dividers. Not for controls: use `ctl`. */
  line: string;
  /** The border of a control (input, ADD, chip): at least 3:1 on the page and on cards. */
  ctl: string;

  /** The header and the cart bar. Dark in both themes, so the logo and main button never change. */
  chrome: string;
  onChrome: string;
  onChromeMuted: string;

  /**
   * The tinted block at the top of Home: address, profile and search. It paints behind the status bar too.
   * Light and soft in the light theme, deep in the dark one; text on it uses `onHeader`.
   */
  headerBg: string;
  onHeader: string;
  onHeaderMuted: string;
  /**
   * What the home header turns into when a category tab is chosen ("All" keeps `headerBg`). Each is checked
   * with `onHeader` and `onHeaderMuted`, so the heading, address and tabs read on every one.
   */
  tintDairy: string;
  tintVegetables: string;
  tintFruits: string;
  tintStaples: string;
  tintSnacks: string;
  /** The round buttons on the header (profile, theme), and the icon on them. */
  headerControl: string;
  onHeaderControl: string;

  /** The main action. Only ever a fill with `onAccent` on it, or text in `accentInk`. */
  accent: string;
  onAccent: string;
  accentPressed: string;
  /** The background of a selected chip, tab or delivery window. */
  accentSubtle: string;
  /** Accent-coloured text (links, prices) that is readable on `surface` and `bg`. */
  accentInk: string;

  /** The deeper olive of the price badge's edge and the divider's mark: a decorative shape, not text. */
  accentEdge: string;

  /** Offer tags. */
  tagBg: string;
  tagFg: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;

  /** Outlined buttons, steppers and progress: ink on light, accent on dark. */
  action: string;
  onAction: string;
  /** The dimmed area behind a sheet. */
  scrim: string;
  /**
   * Dark glass laid over a picture (the insight card and its button). Black at about three quarters, so what is
   * behind it shows faintly; text on it uses `onOverlay` and `onOverlayMuted`.
   */
  overlay: string;
  onOverlay: string;
  onOverlayMuted: string;
}

export const palettes: Record<Scheme, ThemeColors> = {
  light: {
    bg: '#F8F4F7',
    surface: '#FFFFFF',
    muted: '#EFE6EC',
    ink: '#2A1033',
    inkMuted: '#6A5173',
    line: '#E6DBE3',
    ctl: '#86708F',
    chrome: '#3A1646',
    onChrome: '#FFFFFF',
    onChromeMuted: '#D2BDDB',
    headerBg: '#E9D8F0',
    onHeader: '#2A1033',
    onHeaderMuted: '#563E60',
    headerControl: '#FFFFFF',
    onHeaderControl: '#2A1033',
    tintDairy: '#DCE8F5',
    tintVegetables: '#DDEBCF',
    tintFruits: '#F6DDD5',
    tintStaples: '#F3E6C4',
    tintSnacks: '#F2D9E6',
    accent: '#B8E86B',
    onAccent: '#2A1033',
    accentPressed: '#9FD24E',
    accentSubtle: '#EAF8CF',
    accentInk: '#4C7A12',
    accentEdge: '#5E8F17',
    tagBg: '#FFD27A',
    tagFg: '#2A1033',
    success: '#176534',
    successBg: '#E3F3E8',
    warning: '#7A4B00',
    warningBg: '#FFF1D0',
    danger: '#B3261E',
    dangerBg: '#FDE9E7',
    info: '#1A5FB4',
    infoBg: '#E5EEFA',
    action: '#2A1033',
    onAction: '#FFFFFF',
    scrim: 'rgba(42, 16, 51, 0.55)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    onOverlay: '#FFFFFF',
    onOverlayMuted: '#D9D9D9',
  },
  dark: {
    bg: '#0C0C0E',
    surface: '#1B1B1F',
    muted: '#2C2631',
    ink: '#F5F5F7',
    inkMuted: '#B4B4BE',
    line: '#3E3844',
    ctl: '#9A92A4',
    chrome: '#210F2C',
    onChrome: '#FFFFFF',
    onChromeMuted: '#CDBFD6',
    headerBg: '#3E1A4C',
    onHeader: '#FFFFFF',
    onHeaderMuted: '#DCCBE4',
    headerControl: '#F6EEF8',
    onHeaderControl: '#2A1033',
    tintDairy: '#1F3350',
    tintVegetables: '#1F4030',
    tintFruits: '#4D2A24',
    tintStaples: '#463A1A',
    tintSnacks: '#4A2440',
    accent: '#B8E86B',
    onAccent: '#2A1033',
    accentPressed: '#9FD24E',
    accentSubtle: '#33481A',
    accentInk: '#B8E86B',
    accentEdge: '#7BA531',
    tagBg: '#FFD27A',
    tagFg: '#2A1033',
    success: '#93E8AC',
    successBg: '#16341F',
    warning: '#F7CB74',
    warningBg: '#3B2E0E',
    danger: '#FFA8A0',
    dangerBg: '#401A17',
    info: '#9CC4F8',
    infoBg: '#142C4D',
    action: '#B8E86B',
    onAction: '#2A1033',
    scrim: 'rgba(0, 0, 0, 0.7)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    onOverlay: '#FFFFFF',
    onOverlayMuted: '#D9D9D9',
  },
};
