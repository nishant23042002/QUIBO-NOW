/**
 * How a tile's name sits under its picture, so a skeleton can draw the same lines: how many (one or two) and how full each is, as a
 * share of the tile's width. The tile is four across at the smallest text size, so about this many letters fit on a line.
 */
export const TILE_NAME_LETTERS = 10;

const MIN_SHARE = 0.35;
const MAX_SHARE = 0.95;
const MAX_LINES = 2;

/** About how wide a letter of a tile's name is at the smallest text size (the caption style), in dp. */
export const TILE_LETTER_WIDTH = 6.9;

const clampShare = (letters: number, perLine: number): number =>
  Math.min(MAX_SHARE, Math.max(MIN_SHARE, letters / perLine));

/**
 * Breaks a name into lines of whole words, no more than two, and gives each line's fill. A long word stays whole on its line.
 * `perLine` is how many letters fit on a line: the default is the narrowest phone, and a skeleton that knows its tile's width gives
 * the real number, so the lines it draws are the lines the real name will take.
 */
export function tileNameLines(name: string, perLine: number = TILE_NAME_LETTERS): number[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [MIN_SHARE];

  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const joined = current === '' ? word : `${current} ${word}`;
    if (current === '' || [...joined].length <= perLine) {
      current = joined;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);

  return lines.slice(0, MAX_LINES).map((line) => clampShare([...line].length, perLine));
}
