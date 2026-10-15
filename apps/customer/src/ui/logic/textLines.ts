/**
 * How many lines a sentence will take in a box of this width, from its letters: a skeleton cannot measure text, so it draws the
 * lines the sentence is expected to wrap to, and the page that replaces it lands where it stood. `size` is the text's font size in
 * dp. Latin letters of body text average about 0.44 of their size wide; Devanagari, with its joined forms, a little wider.
 * It is an estimate, kept slightly generous at the edge so a sentence that only just fits is counted as fitting.
 */
export function textLines(
  text: string,
  width: number,
  size: number,
  script: 'latin' | 'devanagari' = 'latin',
): number {
  // Joiners and word-joiners take no room.
  const letters = [...text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')].length;
  if (letters === 0 || width <= 0) return 1;
  const perLetter = size * (script === 'latin' ? 0.44 : 0.52);
  return Math.max(1, Math.ceil((letters * perLetter) / width - 0.04));
}
