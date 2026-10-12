/**
 * The width of one card in a grid row: the row's room (the screen less a gutter on each side) shared between the
 * columns with a gap between them, rounded down so the cards and the gaps always fit, whatever the phone's width. One dp is kept
 * spare: a row that is filled exactly can wrap its last card when the phone rounds sizes to whole pixels.
 */
/** The room left over in a row, in dp, so rounding to whole pixels can never push a card onto the next line. */
const SPARE = 1;

export function gridCardWidth(
  screen: number,
  { columns, gutter, gap }: { columns: number; gutter: number; gap: number },
): number {
  return Math.floor((screen - gutter * 2 - gap * (columns - 1) - SPARE) / columns);
}
