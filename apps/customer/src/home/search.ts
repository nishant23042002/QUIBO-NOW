/**
 * Search that understands how people type here: Hindi and Marathi words in English letters ("dudh", "aata"),
 * a few slips of the finger ("mlik"), and half-typed words. It is plain code with no React in it, so it can be
 * tested alone. The real search moves to the server in Phase 2 with the same rules.
 */

/** One thing that can be found: its id, and every phrase it can be found by (names, in every language, and the English-letter spellings people use). */
export interface SearchDoc {
  id: string;
  terms: readonly string[];
}

/** Lower case, with everything that is not a letter or a number turned into a space. Devanagari letters and their signs are kept. */
export function normalise(text: string): string {
  let out = '';
  for (const char of text.toLowerCase()) {
    const code = char.codePointAt(0) ?? 0;
    const keep = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || code >= 0x900;
    out += keep ? char : ' ';
  }
  return out.replace(/\s+/g, ' ').trim();
}

const LATIN_WORD = /^[a-z0-9]+$/;

/**
 * Evens out the ways English letters are used for the same sound, so "aata" and "atta", or "doodh" and "dudh",
 * come out alike or one letter apart. Words in Devanagari are left as they are.
 */
export function fold(word: string): string {
  if (!LATIN_WORD.test(word)) return word;
  return word
    .replace(/ph/g, 'f')
    .replace(/w/g, 'v')
    .replace(/(.)\1+/g, '$1');
}

/** The number of single-letter changes (add, remove, swap, or exchange two neighbours) between two words. */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const grid: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(
        (grid[i - 1]?.[j] ?? 0) + 1,
        (grid[i]?.[j - 1] ?? 0) + 1,
        (grid[i - 1]?.[j - 1] ?? 0) + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, (grid[i - 2]?.[j - 2] ?? 0) + 1);
      }
      (grid[i] as number[])[j] = best;
    }
  }
  return grid[rows - 1]?.[cols - 1] ?? 0;
}

/** How many slips a word of this length may have and still count as a match. Short words must be exact. */
function allowedSlips(length: number): number {
  if (length <= 3) return 0;
  return length <= 6 ? 1 : 2;
}

const EXACT = 3;
const PREFIX = 2.5;
const SLIP = 1.5;
const INSIDE = 1;

/** How well one typed word matches one word of a phrase: 0 for no match. */
function wordScore(typed: string, word: string): number {
  if (typed === word) return EXACT;
  if (word.startsWith(typed)) return PREFIX;
  const slips = allowedSlips(typed.length);
  if (
    slips > 0 &&
    (editDistance(typed, word) <= slips ||
      editDistance(typed, word.slice(0, typed.length)) <= slips)
  ) {
    return SLIP;
  }
  if (typed.length >= 4 && word.includes(typed)) return INSIDE;
  return 0;
}

/**
 * The ids of what matches the query, best first. Every word typed has to match some word of the thing, in any
 * order, so "toned milk" and "milk toned" both find Toned milk. Exact words beat half-typed words, which beat
 * slips. Things that match equally keep the order they were given in.
 */
export function searchDocs(query: string, docs: readonly SearchDoc[]): string[] {
  const typed = normalise(query)
    .split(' ')
    .filter((word) => word !== '')
    .map(fold);
  if (typed.length === 0) return [];

  const scored: { id: string; score: number; index: number }[] = [];
  docs.forEach((doc, index) => {
    const words = doc.terms
      .flatMap((term) => normalise(term).split(' '))
      .filter((word) => word !== '')
      .map(fold);
    let total = 0;
    for (const word of typed) {
      const best = Math.max(0, ...words.map((candidate) => wordScore(word, candidate)));
      if (best === 0) return;
      total += best;
    }
    scored.push({ id: doc.id, score: total, index });
  });
  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((entry) => entry.id);
}

/** How many recent searches are kept. */
export const MAX_RECENT = 6;
/** A search shorter than this is not worth remembering. */
const MIN_REMEMBERED = 2;

/** The recent searches with this one added at the front. A repeat moves to the front instead of showing twice. */
export function addRecent(recent: readonly string[], term: string): string[] {
  const shown = term.trim().replace(/\s+/g, ' ');
  const key = normalise(shown);
  if (key.length < MIN_REMEMBERED) return [...recent];
  return [shown, ...recent.filter((entry) => normalise(entry) !== key)].slice(0, MAX_RECENT);
}

/** Reads the saved list back. Anything that is not a list of words is treated as empty, never as a crash. */
export function parseRecent(saved: string | null): string[] {
  if (saved === null) return [];
  try {
    const value: unknown = JSON.parse(saved);
    if (!Array.isArray(value)) return [];
    return value
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}
