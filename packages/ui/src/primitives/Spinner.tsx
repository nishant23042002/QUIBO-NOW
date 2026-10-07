import { cx } from '../cx';

/** Decorative busy indicator. It carries no text: the control around it announces busy state. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx('shrink-0 motion-safe:animate-spin', className)}
      viewBox="0 0 24 24"
      width="1.25em"
      height="1.25em"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
