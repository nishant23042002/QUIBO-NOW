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
   * The block at the top of every screen: address, profile and search on Home, the title on the others. It paints behind the status
   * bar too. A soft lilac with dark text in the light theme (ADR 0057) and deep plum with white text in the dark one. `onHeader` is
   * for text on the header and not on the pale `tint*` blocks: use `ink` there. A dark card that is not a header (the closing card,
   * the promise) uses `plum`, not this.
   */
  headerBg: string;
  /** The far (right-hand) end of the header's very light sheen; `headerBg` is the left end. Text on it uses `onHeader` too. */
  headerBgEnd: string;
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

  /**
   * A deep aubergine card on the page: the closing card of "Know your shop" and the promise. The same deep colour in both themes
   * (it is what the aubergine is left for once the header is lilac), with a very light sheen from `plum` to `plumEnd`. Text on it
   * uses `onPlum` and `onPlumMuted`.
   */
  plum: string;
  plumEnd: string;
  onPlum: string;
  onPlumMuted: string;
  /**
   * The near-black the "Know your shop" stage starts from, fading in one straight line into the page colour. Text on it uses
   * `onNight` and `onNightMuted`.
   */
  night: string;
  onNight: string;
  onNightMuted: string;

  /** The main action. Only ever a fill with `onAccent` on it, or text in `accentInk`. */
  accent: string;
  onAccent: string;
  accentPressed: string;
  /** A soft green wash for what is saved or on offer (a coupon, a saving, an offer tag, the delivery zone). Chosen options use `lilac`. */
  accentSubtle: string;
  /** Accent-coloured text (links, prices) that is readable on `surface` and `bg`. */
  accentInk: string;
  /**
   * A soft aubergine tint, for blocks that should feel set apart and a little premium without shouting: every chosen option
   * (chip, size, delivery window, address, the active tab), and icon bubbles and promise tiles. Text on it uses `ink` and `inkMuted`.
   */
  lilac: string;
  /** The plate a brand's logo sits on: white in both themes, because logos are made for white. Not used for text. */
  logoPlate: string;
  /**
   * The plate a category's picture sits on: the neutral light grey every picture's own backdrop is flattened to, the same in both
   * themes because the pictures are made on it. Not used for text.
   */
  artworkPlate: string;

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
    // The page is plain white. Whatever sits on it (cards, fields, sheets) takes the faint tint the page used to have, so it still
    // reads as its own object with a fine border and never merges into the page.
    bg: '#FFFFFF',
    surface: '#FBFAFC',
    muted: '#EFE6EC',
    ink: '#2A1033',
    inkMuted: '#6A5173',
    line: '#E6DBE3',
    ctl: '#86708F',
    chrome: '#3A1646',
    onChrome: '#FFFFFF',
    onChromeMuted: '#D2BDDB',
    headerBg: '#E9D8F0',
    headerBgEnd: '#F1E6F7',
    onHeader: '#2A1033',
    onHeaderMuted: '#563E60',
    headerControl: '#FFFFFF',
    onHeaderControl: '#2A1033',
    tintDairy: '#DCE8F5',
    tintVegetables: '#DDEBCF',
    tintFruits: '#F6DDD5',
    tintStaples: '#F3E6C4',
    tintSnacks: '#F2D9E6',
    plum: '#3A1646',
    plumEnd: '#4A2160',
    onPlum: '#FFFFFF',
    onPlumMuted: '#D2BDDB',
    night: '#1B1620',
    onNight: '#FFFFFF',
    onNightMuted: '#D9CCE0',
    accent: '#B8E86B',
    onAccent: '#2A1033',
    accentPressed: '#9FD24E',
    accentSubtle: '#EAF8CF',
    accentInk: '#4C7A12',
    lilac: '#EFE4F5',
    logoPlate: '#FFFFFF',
    artworkPlate: '#F7F7F7',
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
    headerBgEnd: '#4E2663',
    onHeader: '#FFFFFF',
    onHeaderMuted: '#DCCBE4',
    headerControl: '#F6EEF8',
    onHeaderControl: '#2A1033',
    tintDairy: '#1F3350',
    tintVegetables: '#1F4030',
    tintFruits: '#4D2A24',
    tintStaples: '#463A1A',
    tintSnacks: '#4A2440',
    plum: '#3E1A4C',
    plumEnd: '#4E2663',
    onPlum: '#FFFFFF',
    onPlumMuted: '#DCCBE4',
    night: '#1B1620',
    onNight: '#FFFFFF',
    onNightMuted: '#D9CCE0',
    accent: '#B8E86B',
    onAccent: '#2A1033',
    accentPressed: '#9FD24E',
    accentSubtle: '#33481A',
    accentInk: '#B8E86B',
    lilac: '#2A1836',
    logoPlate: '#FFFFFF',
    artworkPlate: '#F7F7F7',
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

/** The moments that have a page of their own (the same ids as `NeedId`; kept here so the palette has no import from `home`). */
export type MomentId = 'teaBreak' | 'breakfast' | 'cookToday' | 'movieNight';

/**
 * The colours of a moment's page, from its header down to its background. Each moment has a mood of its own: Tea Break is tea and
 * biscuit browns, Breakfast Ready morning sun, Cook Today turmeric and chilli, Movie Night a dark cinema with popcorn gold. Text,
 * its quiet form and the label on the accent are each checked for 4.5:1 against what they sit on in palette.test.ts.
 */
export interface MomentColors {
  /** The page behind everything. */
  bg: string;
  /** The header, and the status bar behind it. */
  header: string;
  /** The band under the header that names the moment. */
  band: string;
  /** Text. */
  ink: string;
  /** Captions and hints. */
  inkMuted: string;
  /** The add button, the chosen state and the jump chip that is on. */
  accent: string;
  /** The label on the accent. */
  onAccent: string;
  /** Cards and the picture of a product. */
  card: string;
  /** Fine borders. */
  line: string;
}

/**
 * Light values are the moment as designed. In the dark theme the three light moments take darker values of the same hues, and Movie
 * Night, which is dark already, is the same in both.
 */
export const momentPalettes: Record<MomentId, Record<Scheme, MomentColors>> = {
  teaBreak: {
    light: {
      bg: '#FFF8EE',
      header: '#F0D3A6',
      band: '#F7DDB0',
      ink: '#3A2111',
      inkMuted: '#6B4A2E',
      accent: '#A8501A',
      onAccent: '#FFFFFF',
      card: '#FFFFFF',
      line: '#EBCFA8',
    },
    dark: {
      bg: '#1F150C',
      header: '#3A2615',
      band: '#46301A',
      ink: '#F6E7D3',
      inkMuted: '#D3B898',
      accent: '#E58A45',
      onAccent: '#2A1405',
      card: '#2B1D10',
      line: '#5A4129',
    },
  },
  breakfast: {
    light: {
      bg: '#FFFCF2',
      header: '#FFE08A',
      band: '#FFEDB5',
      ink: '#3A2A08',
      inkMuted: '#735A1E',
      accent: '#B85A0D',
      onAccent: '#FFFFFF',
      card: '#FFFFFF',
      line: '#F0DCA0',
    },
    dark: {
      bg: '#211B08',
      header: '#4A3C0C',
      band: '#5A4A12',
      ink: '#FFF1C2',
      inkMuted: '#DCC77E',
      accent: '#F2B544',
      onAccent: '#2B1C00',
      card: '#2E2610',
      line: '#6B5A1E',
    },
  },
  cookToday: {
    light: {
      bg: '#FFFBEF',
      header: '#F6D463',
      band: '#FBE6A0',
      ink: '#33210A',
      inkMuted: '#6A5320',
      accent: '#C4351F',
      onAccent: '#FFFFFF',
      card: '#FFFFFF',
      line: '#EBD79A',
    },
    dark: {
      bg: '#201A08',
      header: '#4A3F10',
      band: '#594C16',
      ink: '#FFF3C9',
      inkMuted: '#E0CC85',
      accent: '#F0705A',
      onAccent: '#2A0A04',
      card: '#2D2610',
      line: '#695A1D',
    },
  },
  movieNight: {
    light: {
      bg: '#130F1F',
      header: '#231A3B',
      band: '#2D2150',
      ink: '#F7F2FF',
      inkMuted: '#C9BEE0',
      accent: '#FFC857',
      onAccent: '#241A00',
      card: '#1E1730',
      line: '#3A2E57',
    },
    dark: {
      bg: '#130F1F',
      header: '#231A3B',
      band: '#2D2150',
      ink: '#F7F2FF',
      inkMuted: '#C9BEE0',
      accent: '#FFC857',
      onAccent: '#241A00',
      card: '#1E1730',
      line: '#3A2E57',
    },
  },
};
