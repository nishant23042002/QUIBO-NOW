/**
 * The letter shown on a placeholder image: the first character of the name, in any script.
 * Spread into code points so a Devanagari letter is never cut in half. An empty name gets a dot.
 */
export function initialOf(name: string): string {
  const first = Array.from(name.trim())[0];
  return first === undefined ? '·' : first.toUpperCase();
}
