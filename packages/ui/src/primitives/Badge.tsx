import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  /** `danger` is the error state. Colour is never the only cue: always give the badge text. */
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  /** Muted, for something that no longer applies. */
  disabled?: boolean;
  /** Placeholder pill while the value is loading. */
  loading?: boolean;
  /** Text read out while loading. Pass a translated string. */
  loadingLabel?: string;
}

const TONE = {
  neutral: 'bg-surface-muted text-ink',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
} as const;

export function Badge({
  tone = 'neutral',
  disabled = false,
  loading = false,
  loadingLabel,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      aria-busy={loading || undefined}
      data-disabled={disabled || undefined}
      className={cx(
        'inline-flex items-center rounded-full px-3 py-0.5 text-sm font-semibold',
        disabled ? 'bg-surface-muted text-ink-muted' : TONE[tone],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <span
            className="inline-block h-4 w-14 rounded-full bg-line motion-safe:animate-pulse"
            aria-hidden="true"
          />
          {loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
        </>
      ) : (
        children
      )}
    </span>
  );
}
