/*
 * The Quibo Now palette: Aubergine and Pistachio, in a light and a dark theme. This is the only file
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

  /** The main action. Only ever a fill with `onAccent` on it, or text in `accentInk`. */
  accent: string;
  onAccent: string;
  accentPressed: string;
  /** The background of a selected chip, tab or delivery window. */
  accentSubtle: string;
  /** Accent-coloured text (links, prices) that is readable on `surface` and `bg`. */
  accentInk: string;

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
    accent: '#B8E86B',
    onAccent: '#2A1033',
    accentPressed: '#9FD24E',
    accentSubtle: '#EAF8CF',
    accentInk: '#4C7A12',
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
  },
  dark: {
    bg: '#170A1E',
    surface: '#26122F',
    muted: '#341A40',
    ink: '#F6EEF8',
    inkMuted: '#BBA5C4',
    line: '#3E2349',
    ctl: '#9A82A5',
    chrome: '#26122F',
    onChrome: '#FFFFFF',
    onChromeMuted: '#BBA5C4',
    accent: '#B8E86B',
    onAccent: '#2A1033',
    accentPressed: '#9FD24E',
    accentSubtle: '#2F4A12',
    accentInk: '#B8E86B',
    tagBg: '#FFD27A',
    tagFg: '#2A1033',
    success: '#7FD99B',
    successBg: '#10301C',
    warning: '#F2C265',
    warningBg: '#3A2A08',
    danger: '#FF9C94',
    dangerBg: '#3A1512',
    info: '#8DB8F5',
    infoBg: '#10243F',
    action: '#B8E86B',
    onAction: '#2A1033',
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
};
