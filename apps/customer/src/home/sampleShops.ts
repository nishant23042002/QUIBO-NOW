import { useLanguage } from '@/i18n/LanguageProvider';
import type { ShopInfoCardProps } from '@/ui';

/**
 * Sample shops for Home until the mock API supplies them (Phase 1b). Everything the screen shows
 * about a shop is built here, so swapping this hook for the real data changes nothing in the screens.
 */
const SAMPLES = [
  { key: 'one', since: 2009, open: true },
  { key: 'two', since: 1998, open: true },
  { key: 'three', since: 2015, open: true },
  { key: 'four', since: 2004, open: false },
] as const;

export interface SampleShop extends ShopInfoCardProps {
  id: string;
}

export function useSampleShops(): readonly SampleShop[] {
  const { t } = useLanguage();

  return SAMPLES.map(({ key, since, open }) => ({
    id: key,
    name: t(`home.shopsSheet.sample.${key}Name`),
    type: t(`home.shopsSheet.sample.${key}Type`),
    statusLabel: open ? t('home.shopsSheet.open') : t('home.shopsSheet.closed'),
    ...(open
      ? {}
      : {
          statusDetail: t('home.shopsSheet.opensAt', {
            time: t('home.shopsSheet.sample.opensTime'),
          }),
        }),
    open,
    verifiedLabel: t('home.shopsSheet.verified'),
    sinceLabel: t('home.shopsSheet.since', { year: since }),
  }));
}
