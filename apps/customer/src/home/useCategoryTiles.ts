import type { ImageSourcePropType } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme } from '@/theme';
import { SECTIONS, mainsOfSection } from './catalogueTree';
import { tintColor, type TileTarget } from './categoryGroups';
import { departmentPicture } from './departmentPictures';

export interface CategoryTile {
  label: string;
  emoji: string;
  /** The colour behind the picture. */
  tint: string;
  /** The artwork, when the category has any yet. */
  picture?: ImageSourcePropType;
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
    tiles: mainsOfSection(section.id).map((main) => {
      const picture = departmentPicture(main.id);
      return {
        label: t(main.label),
        emoji: main.emoji,
        tint: tintColor(colors, main.tint),
        ...(picture !== undefined ? { picture } : {}),
        target: { kind: 'main' as const, id: main.id },
      };
    }),
  }));
}
