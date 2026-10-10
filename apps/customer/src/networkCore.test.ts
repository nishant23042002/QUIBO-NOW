import { describe, expect, it } from 'vitest';
import { isReachable } from './networkCore';

describe('isReachable', () => {
  it('is online when the phone is connected and reaches the internet', () => {
    expect(isReachable({ isConnected: true, isInternetReachable: true })).toBe(true);
  });

  it('is offline when the phone has no network at all', () => {
    expect(isReachable({ isConnected: false, isInternetReachable: false })).toBe(false);
    expect(isReachable({ isConnected: false, isInternetReachable: null })).toBe(false);
  });

  it('is offline when joined to a network that reaches nothing', () => {
    expect(isReachable({ isConnected: true, isInternetReachable: false })).toBe(false);
  });

  it('gives the benefit of the doubt while the connection is still being checked', () => {
    expect(isReachable({ isConnected: true, isInternetReachable: null })).toBe(true);
    expect(isReachable({ isConnected: null, isInternetReachable: null })).toBe(true);
  });
});
