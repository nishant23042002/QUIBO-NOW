import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme';
import { BARS_MARK, BARS_STACKED, NOW_STACKED, Q_MARK, SIZE, VIEW_BOX, WORDMARK } from './paths';

/**
 * Where the logo sits. "chrome" is the header or the boot screen, which are dark in both themes.
 * "page" is the page itself, so the logo follows the theme.
 */
export type LogoGround = 'chrome' | 'page';

interface LogoColors {
  lines: string;
  letters: string;
  tag: string;
  tagLetters: string;
}

function useLogoColors(ground: LogoGround): LogoColors {
  const { colors, scheme } = useTheme();
  if (ground === 'chrome') {
    return {
      lines: colors.accent,
      letters: colors.onChrome,
      tag: colors.accent,
      tagLetters: colors.onAccent,
    };
  }
  // On the page the accent never touches the background: an ink tag with accent letters on light,
  // an accent tag with dark letters on dark.
  return {
    lines: colors.action,
    letters: colors.ink,
    tag: colors.action,
    tagLetters: scheme === 'light' ? colors.accent : colors.onAccent,
  };
}

interface LogoProps {
  /** What a screen reader says. Pass the translated app name. */
  label: string;
}

/** Logo A: the wordmark with the NOW tag under its right end. For the boot screen and sign-in. */
export function LogoStacked({
  width,
  ground = 'chrome',
  label,
}: LogoProps & { width: number; ground?: LogoGround }) {
  const c = useLogoColors(ground);
  const height = (width * SIZE.stacked.height) / SIZE.stacked.width;
  return (
    <Svg width={width} height={height} viewBox={VIEW_BOX.stacked} aria-label={label} role="img">
      {BARS_STACKED.map((d) => (
        <Path key={d} d={d} fill={c.lines} />
      ))}
      <Path d={WORDMARK} fill={c.letters} />
      <Path d={NOW_STACKED.pill} fill={c.tag} />
      <Path d={NOW_STACKED.letters} fill={c.tagLetters} />
    </Svg>
  );
}

/** The Q mark alone, for places too small for the tag. */
export function QMark({
  size,
  ground = 'chrome',
  label,
}: LogoProps & { size: number; ground?: LogoGround }) {
  const c = useLogoColors(ground);
  const height = (size * SIZE.mark.height) / SIZE.mark.width;
  return (
    <Svg width={size} height={height} viewBox={VIEW_BOX.mark} aria-label={label} role="img">
      {BARS_MARK.map((d) => (
        <Path key={d} d={d} fill={c.lines} />
      ))}
      <Path d={Q_MARK} fill={c.letters} />
    </Svg>
  );
}
