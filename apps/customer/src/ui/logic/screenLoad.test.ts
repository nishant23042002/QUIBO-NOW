import { describe, expect, it } from 'vitest';
import {
  asksNetwork,
  phaseAfter,
  settle,
  shouldRestartOnFocus,
  type FocusFacts,
  type LoadPolicy,
} from './screenLoad';

const needsServer: LoadPolicy = { offline: 'block', failure: 'block' };
const onThePhone: LoadPolicy = { offline: 'allow', failure: 'block' };
const settings: LoadPolicy = { offline: 'allow', failure: 'ignore' };

describe('phaseAfter', () => {
  it('is ready when the network answers', () => {
    for (const policy of [needsServer, onThePhone, settings]) {
      expect(phaseAfter('ok', policy)).toBe('ready');
    }
  });

  it('blocks on no network only for a page that needs the server', () => {
    expect(phaseAfter('offline', needsServer)).toBe('offline');
    expect(phaseAfter('offline', onThePhone)).toBe('ready');
    expect(phaseAfter('offline', settings)).toBe('ready');
  });

  it('blocks on a failed load unless the page ignores failures', () => {
    expect(phaseAfter('failed', needsServer)).toBe('failed');
    expect(phaseAfter('failed', onThePhone)).toBe('failed');
    expect(phaseAfter('failed', settings)).toBe('ready');
  });
});

describe('asksNetwork', () => {
  it('does not ask for a page that can neither be blocked by being offline nor fail', () => {
    expect(asksNetwork(settings)).toBe(false);
    expect(asksNetwork(onThePhone)).toBe(true);
    expect(asksNetwork(needsServer)).toBe(true);
  });
});

describe('settle', () => {
  it('keeps a page that is showing, and takes the new phase otherwise', () => {
    expect(settle('ready', 'offline')).toBe('ready');
    expect(settle('loading', 'offline')).toBe('offline');
    expect(settle('offline', 'ready')).toBe('ready');
    expect(settle('failed', 'ready')).toBe('ready');
  });
});

describe('shouldRestartOnFocus', () => {
  const base: FocusFacts = {
    seenBefore: true,
    quiet: false,
    everLoaded: true,
    freshOnOpen: false,
    builtInFront: false,
    leftForAnotherTab: false,
  };

  it('shows a tab built in the background its skeleton the first time it is chosen', () => {
    const tab = { ...base, seenBefore: false, freshOnOpen: true };
    expect(shouldRestartOnFocus(tab)).toBe(true);
    expect(shouldRestartOnFocus({ ...tab, builtInFront: true })).toBe(false);
    expect(shouldRestartOnFocus({ ...base, seenBefore: false })).toBe(false);
  });

  it('loads a tab again when it is chosen from another tab, even if its own rule is quiet', () => {
    const tab = { ...base, freshOnOpen: true, quiet: true };
    expect(shouldRestartOnFocus({ ...tab, leftForAnotherTab: true })).toBe(true);
  });

  it('leaves a tab as it was when it is only uncovered, if its rule is quiet', () => {
    const tab = { ...base, freshOnOpen: true, quiet: true };
    expect(shouldRestartOnFocus(tab)).toBe(false);
    expect(shouldRestartOnFocus({ ...tab, quiet: false })).toBe(true);
  });

  it('follows the quiet rule for a screen that is not a tab', () => {
    expect(shouldRestartOnFocus(base)).toBe(true);
    expect(shouldRestartOnFocus({ ...base, quiet: true })).toBe(false);
    expect(shouldRestartOnFocus({ ...base, quiet: true, everLoaded: false })).toBe(true);
  });
});
