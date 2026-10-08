import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { IconButton } from './IconButton';

/** The sun or moon button at the top right of every header. It shows the theme you would switch to. */
export function ThemeToggle() {
  const { scheme, toggle } = useTheme();
  const { t } = useLanguage();
  const toDark = scheme === 'light';

  return (
    <IconButton
      icon={toDark ? 'moon' : 'sun'}
      label={toDark ? t('theme.toDark') : t('theme.toLight')}
      onPress={toggle}
    />
  );
}
