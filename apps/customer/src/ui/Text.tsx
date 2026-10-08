import {
  Text as NativeText,
  type TextProps as NativeTextProps,
  type TextStyle,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, fontSize, leading, type ColorName } from './tokens';

interface VariantStyle {
  fontSize: number;
  fontWeight: NonNullable<TextStyle['fontWeight']>;
  leading: keyof typeof leading.latin;
}

const variants = {
  title: { fontSize: fontSize['3xl'], fontWeight: '700', leading: 'tight' },
  heading: { fontSize: fontSize.xl, fontWeight: '700', leading: 'tight' },
  lead: { fontSize: fontSize.lg, fontWeight: '400', leading: 'relaxed' },
  body: { fontSize: fontSize.base, fontWeight: '400', leading: 'normal' },
  label: { fontSize: fontSize.base, fontWeight: '600', leading: 'normal' },
  caption: { fontSize: fontSize.xs, fontWeight: '400', leading: 'normal' },
} as const satisfies Record<string, VariantStyle>;

export type TextVariant = keyof typeof variants;

export interface TextProps extends Omit<NativeTextProps, 'style'> {
  variant?: TextVariant;
  color?: ColorName;
}

/**
 * The only way text reaches a screen. It uses system fonts, follows the phone's text-size
 * setting up to 200%, and gives Hindi and Marathi the extra line height they need.
 */
export function Text({ variant = 'body', color = 'ink', ...rest }: TextProps) {
  const { locale } = useLanguage();
  const { fontSize: size, fontWeight, leading: spacing } = variants[variant];
  const lineHeight = Math.round(size * leading[locale === 'en' ? 'latin' : 'devanagari'][spacing]);
  const isHeading = variant === 'title' || variant === 'heading';

  return (
    <NativeText
      maxFontSizeMultiplier={2}
      role={isHeading ? 'heading' : undefined}
      {...rest}
      style={{ color: colors[color], fontSize: size, fontWeight, lineHeight }}
    />
  );
}
