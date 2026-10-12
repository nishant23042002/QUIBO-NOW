import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { MAIN_CATEGORIES, SECTIONS, mainsOfSection } from './catalogueTree';
import { tintColor, type TileTarget } from './categoryGroups';

export interface CategoryTile {
  label: string;
  emoji: string;
  /** The colour behind the picture. */
  tint: string;
  target: TileTarget;
}

export interface CategoryGroup {
  title: string;
  tiles: readonly CategoryTile[];
}

/**
 * The Categories tab's sections, each with its main categories as tiles that open the category's own screen, worded in the chosen
 * language and coloured for the current theme.
 */
export function useCategoryGroups(): readonly CategoryGroup[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  return SECTIONS.map((section) => ({
    title: t(section.label),
    tiles: mainsOfSection(section.id).map((main) => ({
      label: t(main.label),
      emoji: main.emoji,
      tint: tintColor(colors, main.tint),
      target: { kind: 'main' as const, id: main.id },
    })),
  }));
}

/** Home's "Shop by category" tiles: every main category, the same tiles as the Categories tab. */
export function useHomeCategoryTiles(): readonly CategoryTile[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  return MAIN_CATEGORIES.map((main) => ({
    label: t(main.label),
    emoji: main.emoji,
    tint: tintColor(colors, main.tint),
    target: { kind: 'main' as const, id: main.id },
  }));
}
