type ClassPart = string | false | null | undefined;

/** Join class names, skipping anything falsy: cx('a', isOn && 'b') gives 'a b' or 'a'. */
export function cx(...parts: readonly ClassPart[]): string {
  return parts.filter((part): part is string => typeof part === 'string' && part !== '').join(' ');
}
