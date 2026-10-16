import { useState } from 'react';

/**
 * The address value a screen was opened with, kept after the address lets go of it. While a screen slides away (going back), the
 * router can already report its parameter as missing; a screen that then drew its "not found" page would flash it for the length of
 * the slide. This keeps the last real value, so the leaving screen keeps showing what it showed.
 */
export function useLastParam(value: string | undefined): string | undefined {
  const [kept, setKept] = useState(value);
  if (value !== undefined && value !== kept) setKept(value);
  return value ?? kept;
}
