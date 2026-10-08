import { useLanguage } from '@/i18n/LanguageProvider';
import { ComingSoon } from '@/ui';

// Built in a later section of Phase 1.
export default function CategoriesScreen() {
  const { t } = useLanguage();
  return <ComingSoon title={t('nav.categories')} />;
}
