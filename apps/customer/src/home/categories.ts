import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import type { CategoryTab } from '@/ui';

/**
 * The categories on Home (each with an emoji: a cart, milk, a carrot, an apple, wheat and a cookie), until the mock API supplies them (Phase 1b). Each has its own tint, which the
 * header takes when the tab is chosen. "All" keeps the header's usual colour.
 */
export interface HomeCategory extends CategoryTab {
  /** The pale colour of the category: behind its item pictures, and the old header tint. */
  tint: string;
  /** The deep colour the header fades into while the tab is chosen. */
  deep: string;
}

export function useHomeCategories(): readonly HomeCategory[] {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return [
    {
      key: 'all',
      label: t('home.categories.all'),
      emoji: '\u{1F6D2}',
      tint: colors.headerBg,
      deep: colors.headerDeep,
    },
    {
      key: 'dairy',
      label: t('home.categories.dairy'),
      emoji: '\u{1F95B}',
      tint: colors.tintDairy,
      deep: colors.deepDairy,
    },
    {
      key: 'vegetables',
      label: t('home.categories.vegetables'),
      emoji: '\u{1F955}',
      tint: colors.tintVegetables,
      deep: colors.deepVegetables,
    },
    {
      key: 'fruits',
      label: t('home.categories.fruits'),
      emoji: '\u{1F34E}',
      tint: colors.tintFruits,
      deep: colors.deepFruits,
    },
    {
      key: 'staples',
      label: t('home.categories.staples'),
      emoji: '\u{1F33E}',
      tint: colors.tintStaples,
      deep: colors.deepStaples,
    },
    {
      key: 'snacks',
      label: t('home.categories.snacks'),
      emoji: '\u{1F36A}',
      tint: colors.tintSnacks,
      deep: colors.deepSnacks,
    },
  ];
}

/** The colour behind an item picture for its category: the same on a card, in the detail and in the cart. */
export function useTintOf(): (category: string) => string {
  const categories = useHomeCategories();
  return (category) => categories.find((candidate) => candidate.key === category)?.tint ?? '';
}
