/**
 * The line under the account card. A shopper who signed in has a number to show; a tester who skipped the sign-in (development
 * builds only) has none, and the card says so instead of showing an empty line.
 */
export type SignedIn = { kind: 'number'; phone: string } | { kind: 'skipped' };

export function signedInOf(phone: string | null): SignedIn {
  return phone === null ? { kind: 'skipped' } : { kind: 'number', phone };
}

/** The app's version for the foot of the page. A build with no version says nothing rather than "undefined". */
export function versionOf(version: string | undefined | null): string | null {
  const trimmed = version?.trim();
  return trimmed === undefined || trimmed === '' ? null : trimmed;
}
