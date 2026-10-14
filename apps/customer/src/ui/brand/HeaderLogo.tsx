import { useWindowDimensions } from 'react-native';
import { headerLogoWidth } from './headerLogoWidth';
import { LogoStacked } from './Logo';

/** The full QUIBO NOW logo for the header (lilac in the light theme, plum in the dark one), sized to the screen so it always fits. */
export function HeaderLogo({ label }: { label: string }) {
  const { width } = useWindowDimensions();
  return <LogoStacked width={headerLogoWidth(width)} ground="page" label={label} />;
}
