import {
  Text as NativeText,
  type TextProps as NativeTextProps,
  type TextStyle,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type ThemeColors } from '@/theme';
import { fontSize, leading } from './tokens';

/** What a piece of text is for, which decides its weight: `display` is a heading, `emphasis` a name, label or link, `regular` the rest. */
type Role = 'display' | 'emphasis' | 'regular';

interface VariantStyle {
  fontSize: number;
  role: Role;
  leading: keyof typeof leading.latin;
}

/**
 * Weights by script. Nothing is 700 or above: on a phone, bold small text makes a whole screen look loud. Latin gets
 * 600 for headings (they are large, so they need no more), and a medium 500 for names, labels and links, which is plainly
 * heavier than the regular text beside it. Devanagari is set one step heavier, because its fonts are often only Regular
 * and Bold (a 500 would quietly fall back to Regular and the emphasis would vanish), and because its fine strokes and
 * joined letters are harder to read thin at small sizes.
 */
const WEIGHTS = {
  latin: { display: '600', emphasis: '500', regular: '400' },
  devanagari: { display: '600', emphasis: '600', regular: '400' },
} as const satisfies Record<string, Record<Role, NonNullable<TextStyle['fontWeight']>>>;

const variants = {
  title: { fontSize: fontSize['3xl'], role: 'display', leading: 'tight' },
  heading: { fontSize: fontSize.xl, role: 'display', leading: 'tight' },
  subheading: { fontSize: fontSize.lg, role: 'display', leading: 'tight' },
  lead: { fontSize: fontSize.lg, role: 'regular', leading: 'relaxed' },
  body: { fontSize: fontSize.base, role: 'regular', leading: 'normal' },
  label: { fontSize: fontSize.base, role: 'emphasis', leading: 'normal' },
  caption: { fontSize: fontSize.xs, role: 'emphasis', leading: 'normal' },
  small: { fontSize: fontSize.sm, role: 'regular', leading: 'normal' },
  /** The smallest regular text: a line of supporting detail under something, not a label. */
  fine: { fontSize: fontSize.xs, role: 'regular', leading: 'normal' },
  strong: { fontSize: fontSize.sm, role: 'emphasis', leading: 'normal' },
} as const satisfies Record<string, VariantStyle>;

export type TextVariant = keyof typeof variants;

/** The theme colours that text may use. Each is checked against the surface it sits on. */
export type TextColor = Extract<
  keyof ThemeColors,
  | 'ink'
  | 'inkMuted'
  | 'onChrome'
  | 'onChromeMuted'
  | 'onHeader'
  | 'onHeaderMuted'
  | 'onHeaderControl'
  | 'onAccent'
  | 'onOverlay'
  | 'onOverlayMuted'
  | 'onAction'
  | 'action'
  | 'accentInk'
  | 'accent'
  | 'tagFg'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
>;

export interface TextProps extends Omit<NativeTextProps, 'style'> {
  variant?: TextVariant;
  color?: TextColor;
  /** A line through the text, for a printed price that has been beaten. */
  strike?: boolean;
  /** Where the lines sit when the text wraps. Centred text is for empty and error states. */
  align?: 'left' | 'center';
}

/**
 * The only way text reaches a screen. It uses system fonts, follows the phone's text-size
 * setting up to 200%, and gives Hindi and Marathi the extra line height they need.
 */
export function Text({
  variant = 'body',
  color = 'ink',
  strike = false,
  align = 'left',
  ...rest
}: TextProps) {
  const { locale } = useLanguage();
  const { colors } = useTheme();
  const { fontSize: size, role, leading: spacing } = variants[variant];
  const script = locale === 'en' ? 'latin' : 'devanagari';
  const lineHeight = Math.round(size * leading[script][spacing]);
  const isHeading = variant === 'title' || variant === 'heading';

  return (
    <NativeText
      maxFontSizeMultiplier={2}
      role={isHeading ? 'heading' : undefined}
      {...rest}
      style={{
        color: colors[color],
        fontSize: size,
        fontWeight: WEIGHTS[script][role],
        lineHeight,
        textDecorationLine: strike ? 'line-through' : 'none',
        textAlign: align,
      }}
    />
  );
}
