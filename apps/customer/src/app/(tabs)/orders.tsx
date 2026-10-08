import { useLanguage } from '@/i18n/LanguageProvider';
import { ComingSoon } from '@/ui';

// Built in a later section of Phase 1.
export default function OrdersScreen() {
  const { t } = useLanguage();
  return <ComingSoon title={t('nav.orders')} />;
}
