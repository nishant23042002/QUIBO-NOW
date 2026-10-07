import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { Spinner } from './Spinner';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  /**
   * Busy: shows a spinner, announces aria-busy, and ignores clicks (including form submit).
   * The label stays visible so the button does not change width.
   */
  loading?: boolean;
}

const VARIANT = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover',
  secondary: 'border-2 border-line-strong bg-surface text-ink hover:bg-surface-muted',
  ghost: 'bg-transparent text-brand hover:bg-brand-subtle',
} as const;

const SIZE = {
  md: 'tap-target text-base',
  lg: 'tap-target min-h-14 text-lg',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={(event) => {
        if (loading) {
          // A busy submit button must not submit the form a second time.
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md px-5 font-semibold select-none',
        'transition-colors duration-(--qb-duration-fast) ease-standard',
        'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled-bg disabled:text-disabled-text',
        'aria-disabled:cursor-progress',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
