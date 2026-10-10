/** The part of the phone's connection report the app looks at. */
export interface ConnectionReport {
  /** Whether the phone is joined to a network at all. Null while it is not yet known. */
  isConnected: boolean | null;
  /** Whether that network reaches the internet. Null while it is still being checked. */
  isInternetReachable: boolean | null;
}

/**
 * Whether the app should behave as online. It takes the phone's word when the phone is sure it is offline, and gives the benefit of
 * the doubt otherwise: while the connection is still being checked (null), a shopper is not told they are offline, and a failed
 * request is reported by the request itself.
 */
export function isReachable(report: ConnectionReport): boolean {
  return report.isConnected !== false && report.isInternetReachable !== false;
}
