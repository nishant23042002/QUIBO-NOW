'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface SheetProps {
  open: boolean;
  /** Called on Escape, the close button and a tap on the dimmed area. Set `open` to false in it. */
  onClose: () => void;
  /** Heading, and the accessible name of the sheet. */
  title: string;
  /** Accessible name of the close button. Pass a translated string. */
  closeLabel: string;
  children: ReactNode;
  /** Sticky area under the content, for the main action. */
  footer?: ReactNode;
  /** Error shown at the top, announced to screen readers. */
  error?: ReactNode;
  /** Something inside is loading: announces aria-busy. */
  busy?: boolean;
}

/**
 * A bottom sheet on the native <dialog> element. The browser gives it a focus trap, Escape to
 * close, an inert page behind it and focus return, so no library is needed.
 */
export function Sheet({
  open,
  onClose,
  title,
  closeLabel,
  children,
  footer,
  error,
  busy = false,
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // A tap on the dimmed backdrop closes the sheet. This is a pointer shortcut only:
    // keyboard users have Escape and the close button.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 mt-auto max-h-none w-full max-w-none rounded-t-xl border-0 bg-surface p-0 text-ink shadow-sheet backdrop:bg-scrim open:animate-sheet-in"
    >
      <div className="flex max-h-[90dvh] flex-col pb-[env(safe-area-inset-bottom)]">
        <header className="flex items-center justify-between gap-3 border-b-2 border-line px-5 py-2">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="tap-target inline-flex items-center justify-center rounded-full text-ink hover:bg-surface-muted"
          >
            <svg
              viewBox="0 0 24 24"
              width="1.5rem"
              height="1.5rem"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        {error ? (
          <div
            role="alert"
            className="border-b-2 border-danger bg-danger-subtle px-5 py-3 text-sm font-semibold text-danger"
          >
            {error}
          </div>
        ) : null}
        <div className="overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer ? <footer className="border-t-2 border-line px-5 py-3">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
