import { useLanguage } from '@/i18n/LanguageProvider';
import type { SearchHint } from '@/ui';

/** The words the search bar types out in turn, on Home and on the Categories tab. They are examples; the bar opens the search screen. */
const SEARCH_HINT_WORDS = [
  'home.search.itemMilk',
  'home.search.itemAtta',
  'home.search.itemVegetables',
  'home.search.itemBread',
] as const;

/** The typing hint for a search bar: a fixed word and a changing item, worded in the chosen language. */
export function useSearchHint(): SearchHint {
  const { t } = useLanguage();
  return {
    label: t('home.search.hintLabel'),
    words: SEARCH_HINT_WORDS.map((item) => t(item)),
  };
}
