/**
 * The phases a page goes through when it opens. While the app runs on mock data the "load" is a short pause that stands in
 * for asking the server, and the network switches on the Profile screen rehearse the ways it can go wrong.
 */
export type LoadPhase = 'loading' | 'ready' | 'offline' | 'failed';

/** What asking the network came back with. */
export type LoadResult = 'ok' | 'offline' | 'failed';

/**
 * How a page treats a bad connection. A page whose content lives on the phone (the cart, the settings) can `allow` being
 * offline and still show; one that needs the server (delivery windows, coupons) `block`s with an offline screen. A page
 * that can never fail (the settings) `ignore`s a failed load, and then does not even ask, so a failure that was set up
 * for another page is not used up on it.
 */
export interface LoadPolicy {
  offline: 'block' | 'allow';
  failure: 'block' | 'ignore';
}

/** Whether the network needs to be asked at all. */
export function asksNetwork(policy: LoadPolicy): boolean {
  return policy.offline === 'block' || policy.failure === 'block';
}

/** The phase a page ends up in once the network has answered. */
export function phaseAfter(result: LoadResult, policy: LoadPolicy): LoadPhase {
  if (result === 'offline') return policy.offline === 'block' ? 'offline' : 'ready';
  if (result === 'failed') return policy.failure === 'block' ? 'failed' : 'ready';
  return 'ready';
}

/** A page that is already showing stays up if the network drops later; only one still loading, or blocked, can change. */
export function settle(current: LoadPhase, next: LoadPhase): LoadPhase {
  return current === 'ready' ? current : next;
}

/** What is known when a screen comes to the front. */
export interface FocusFacts {
  /** It has been in front before. */
  seenBefore: boolean;
  /** The screen's own rule says a return should leave it as it is (a return from a step opened from it). */
  quiet: boolean;
  /** It has loaded at least once. */
  everLoaded: boolean;
  /** A tab: it loads again each time it is chosen from another tab, and the first time after it was built early. */
  freshOnOpen: boolean;
  /** It was built while it was in front, so the load that began with it is the one. */
  builtInFront: boolean;
  /** It went out of front because another tab was chosen, not because a screen was opened over it. */
  leftForAnotherTab: boolean;
}

/**
 * Whether a screen that has come to the front loads again, showing its skeleton. A screen built in the background has not been
 * seen, so a tab shows its skeleton the first time it is chosen. After that a tab loads again when it is chosen from another tab, and
 * stays as it was when it is only uncovered (back from a screen opened over it). Any other screen follows its own quiet rule.
 */
export function shouldRestartOnFocus(facts: FocusFacts): boolean {
  if (!facts.seenBefore) return facts.freshOnOpen && !facts.builtInFront;
  if (facts.freshOnOpen && facts.leftForAnotherTab) return true;
  return !(facts.quiet && facts.everLoaded);
}
