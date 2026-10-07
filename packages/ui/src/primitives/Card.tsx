import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';

export interface CardProps extends ComponentPropsWithRef<'div'> {
  /** `error` is for a card whose content failed to load or is invalid. */
  tone?: 'default' | 'error';
  /** Muted and not clickable. A card is not a control, so this is look-only: disable its buttons yourself. */
  disabled?: boolean;
  /** Replace the content with a skeleton and announce aria-busy. */
  loading?: boolean;
  /** Text read out while loading. Pass a translated string. */
  loadingLabel?: string;
}

export function Card({
  tone = 'default',
  disabled = false,
  loading = false,
  loadingLabel,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      aria-busy={loading || undefined}
      data-disabled={disabled || undefined}
      className={cx(
        'rounded-lg border-2 p-4 text-ink shadow-sm',
        tone === 'error' ? 'border-danger bg-danger-subtle' : 'border-line bg-surface',
        disabled && 'pointer-events-none bg-surface-muted text-ink-muted shadow-none',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <div className="flex flex-col gap-3" aria-hidden="true">
            <div className="h-5 w-2/3 rounded-sm bg-surface-muted motion-safe:animate-pulse" />
            <div className="h-4 w-full rounded-sm bg-surface-muted motion-safe:animate-pulse" />
            <div className="h-4 w-5/6 rounded-sm bg-surface-muted motion-safe:animate-pulse" />
          </div>
          {loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
        </>
      ) : (
        children
      )}
    </div>
  );
}
