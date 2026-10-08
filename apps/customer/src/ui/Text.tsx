import {
  Text as NativeText,
  type TextProps as NativeTextProps,
  type TextStyle,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type ThemeColors } from '@/theme';
import { fontSize, leading } from './tokens';

interface VariantStyle {
  fontSize: number;
  fontWeight: NonNullable<TextStyle['fontWeight']>;
  leading: keyof typeof leading.latin;
}

const variants = {
  title: { fontSize: fontSize['3xl'], fontWeight: '700', leading: 'tight' },
  heading: { fontSize: fontSize.xl, fontWeight: '700', leading: 'tight' },
  subheading: { fontSize: fontSize.lg, fontWeight: '700', leading: 'tight' },
  lead: { fontSize: fontSize.lg, fontWeight: '400', leading: 'relaxed' },
  body: { fontSize: fontSize.base, fontWeight: '400', leading: 'normal' },
  label: { fontSize: fontSize.base, fontWeight: '600', leading: 'normal' },
  caption: { fontSize: fontSize.xs, fontWeight: '600', leading: 'normal' },
  small: { fontSize: fontSize.sm, fontWeight: '400', leading: 'normal' },
  strong: { fontSize: fontSize.sm, fontWeight: '600', leading: 'normal' },
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
  const { fontSize: size, fontWeight, leading: spacing } = variants[variant];
  const lineHeight = Math.round(size * leading[locale === 'en' ? 'latin' : 'devanagari'][spacing]);
  const isHeading = variant === 'title' || variant === 'heading';

  return (
    <NativeText
      maxFontSizeMultiplier={2}
      role={isHeading ? 'heading' : undefined}
      {...rest}
      style={{
        color: colors[color],
        fontSize: size,
        fontWeight,
        lineHeight,
        textDecorationLine: strike ? 'line-through' : 'none',
        textAlign: align,
      }}
    />
  );
}
