/**
 * The width of one card in a grid row: the row's room (the screen less a gutter on each side) shared between the
 * columns with a gap between them, rounded down so the cards and the gaps always fit, whatever the phone's width.
 */
export function gridCardWidth(
  screen: number,
  { columns, gutter, gap }: { columns: number; gutter: number; gap: number },
): number {
  return Math.floor((screen - gutter * 2 - gap * (columns - 1)) / columns);
}
