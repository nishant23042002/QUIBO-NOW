import type { Category } from './catalogueTree';

/** The most pictures a wide tile shows side by side. */
const MOST = 3;

/**
 * The pictures a wide tile shows for a category: its kinds' pictures, in order, so a tile for fruits and vegetables shows a tomato
 * and an apple and not one stand-in. A category with no kinds shows its own picture.
 */
export function subsEmojis(entry: Category | undefined): readonly string[] {
  if (entry === undefined) return [];
  const kinds = entry.subs.map((sub) => sub.emoji).slice(0, MOST);
  return kinds.length > 0 ? kinds : [entry.emoji];
}
