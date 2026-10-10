import { describe, expect, it } from 'vitest';
import { signedInOf, versionOf } from './logic';

describe('signedInOf', () => {
  it('shows the number of a shopper who signed in', () => {
    expect(signedInOf('9876543210')).toEqual({ kind: 'number', phone: '9876543210' });
  });

  it('says so for a tester who skipped the sign-in', () => {
    expect(signedInOf(null)).toEqual({ kind: 'skipped' });
  });
});

describe('versionOf', () => {
  it('gives the version as it is', () => {
    expect(versionOf('1.2.3')).toBe('1.2.3');
    expect(versionOf(' 1.2.3 ')).toBe('1.2.3');
  });

  it('gives nothing when there is no version', () => {
    expect(versionOf(undefined)).toBeNull();
    expect(versionOf(null)).toBeNull();
    expect(versionOf('  ')).toBeNull();
  });
});
