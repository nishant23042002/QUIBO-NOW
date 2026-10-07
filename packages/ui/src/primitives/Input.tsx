import { useId, type ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { Spinner } from './Spinner';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  /** Visible label. Required: placeholder text is not a label. */
  label: string;
  /** Help text under the field. */
  hint?: string;
  /** Error message. Sets aria-invalid and is read out with the field. */
  error?: string;
  /** Busy (for example checking a value on the server): shows a spinner and announces aria-busy. */
  loading?: boolean;
}

function ErrorIcon() {
  // The icon is the second cue besides colour, so the error is not conveyed by red alone.
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.25em"
      height="1.25em"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="mt-0.5 shrink-0"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function Input({
  label,
  hint,
  error,
  loading = false,
  id,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, errorId, hintId]
      .filter((part) => part !== undefined && part !== '')
      .join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-base font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-busy={loading || undefined}
          className={cx(
            'tap-target block w-full rounded-md border-2 border-line-strong bg-surface px-4 text-base text-ink',
            'placeholder:text-ink-muted',
            'aria-invalid:border-danger',
            'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled-bg disabled:text-disabled-text',
            loading && 'pe-12',
            className,
          )}
          {...rest}
        />
        {loading ? (
          <Spinner className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-muted" />
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-semibold text-danger">
          <ErrorIcon />
          {error}
        </p>
      ) : null}
    </div>
  );
}
