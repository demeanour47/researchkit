import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

/** A key on the keyboard, such as in “Press ⌘K to search”. */
export function Kbd({ className, ...rest }: ComponentPropsWithRef<"kbd">) {
  return (
    <kbd
      className={cx(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-border-strong bg-surface px-1.5 font-body text-caption font-medium text-text-muted shadow-card",
        className,
      )}
      {...rest}
    />
  );
}
