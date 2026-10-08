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

export interface ShopDetails extends SampleShop {
  /** When the shop is open, for example "Hours 7 AM – 9 PM". */
  hoursLabel: string;
  /** The shop's food-safety licence number. A sample, marked as one, until the shop's real number is on file (Phase 2). */
  licence: string;
  /** Where to write about an order. A sample address on a reserved domain, until the real one is set up. */
  care: string;
}

const SAMPLE_LICENCE: Readonly<Record<string, string>> = {
  one: 'SAMPLE-FSSAI-0001',
  two: 'SAMPLE-FSSAI-0002',
  three: 'SAMPLE-FSSAI-0003',
  four: 'SAMPLE-FSSAI-0004',
};
const SAMPLE_CARE = 'care@quibo.example';

/** One shop by its id, with what its own page shows besides the card, or undefined when there is no such shop. */
export function useShop(id: string | undefined): ShopDetails | undefined {
  const { t } = useLanguage();
  const shops = useSampleShops();
  const shop = shops.find((candidate) => candidate.id === id);
  if (shop === undefined) return undefined;
  return {
    ...shop,
    hoursLabel: t('shop.hours', { hours: t('shop.sampleHours') }),
    licence: SAMPLE_LICENCE[shop.id] ?? '',
    care: SAMPLE_CARE,
  };
}
