import { useLanguage } from '@/i18n/LanguageProvider';
import { useTheme, type ThemeColors } from '@/theme';
import type { CategoryGridTile } from '@/ui';
import {
  GRID_SIZE,
  departmentIndex,
  departmentsMatching,
  gridDepartments,
  isLive,
  resolveDepartments,
  type Department,
} from './departments';
import { tintColor } from './categoryGroups';
import { departmentPicture } from './departmentPictures';
import { useHomeItems } from './items';

/** One tile of "Shop by department": the grid's tile, and the department it stands for. */
export interface DepartmentTile extends CategoryGridTile {
  department: Department;
}

type Translate = ReturnType<typeof useLanguage>['t'];

/**
 * A department as a tile: worded in the chosen language and coloured for the current theme. One that is coming is softened and says
 * so; one that arrives tomorrow says that. Today is the usual and is not repeated on every tile.
 */
function tileOf(department: Department, t: Translate, colors: ThemeColors): DepartmentTile {
  const picture = departmentPicture(department.id);
  return {
    department,
    label: t(department.label),
    emoji: department.emoji,
    tint: tintColor(colors, department.tint),
    ...(picture !== undefined ? { picture } : {}),
    ...(department.tag === 'today' ? {} : { tag: t(`departments.tags.${department.tag}`) }),
    ...(isLive(department) ? {} : { soon: true }),
  };
}

/** The tiles of Home's "Shop by department": the live departments first, then the ones that are coming, up to eight. */
export function useDepartmentTiles(): readonly DepartmentTile[] {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();

  return gridDepartments(resolveDepartments(items), GRID_SIZE).map((department) =>
    tileOf(department, t, colors),
  );
}

export interface DepartmentSection {
  /** A stable key for the section. */
  id: string;
  /** Already translated. */
  title: string;
  tiles: readonly DepartmentTile[];
}

/**
 * The All departments screen: the live departments in their groups, then those coming to Roha, each section a title and its tiles.
 * `query` narrows them by name (a section with none left is dropped). `total` is how many departments the town lists, before the
 * query, so the screen can tell "no departments" from "none match".
 */
export function useDepartmentIndex(query = ''): {
  sections: readonly DepartmentSection[];
  total: number;
} {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const items = useHomeItems();
  const { groups, coming } = departmentIndex(resolveDepartments(items));
  const nameOf = (entry: Department) => t(entry.label);
  const narrow = (departments: readonly Department[]) =>
    departmentsMatching(departments, query, nameOf).map((entry) => tileOf(entry, t, colors));

  const sections: DepartmentSection[] = [
    ...groups.map((entry) => ({
      id: entry.group.id,
      title: t(entry.group.label),
      tiles: narrow(entry.departments),
    })),
    { id: 'coming', title: t('departments.comingTitle'), tiles: narrow(coming) },
  ].filter((section) => section.tiles.length > 0);

  return {
    sections,
    total: groups.reduce((sum, entry) => sum + entry.departments.length, coming.length),
  };
}
