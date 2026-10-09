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
