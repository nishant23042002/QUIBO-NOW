import { useLanguage } from '@/i18n/LanguageProvider';
import type { SearchHint } from '@/ui';

/** The example words the search bar takes turns showing, on Home and on the Categories tab. The bar opens the search screen. */
const SEARCH_HINT_WORDS = [
  'home.search.itemMilk',
  'home.search.itemAtta',
  'home.search.itemVegetables',
  'home.search.itemBread',
] as const;

/** The hint for a search bar: a fixed word and the example items that take turns, worded in the chosen language. */
export function useSearchHint(): SearchHint {
  const { t } = useLanguage();
  return {
    label: t('home.search.hintLabel'),
    words: SEARCH_HINT_WORDS.map((item) => t(item)),
  };
}
