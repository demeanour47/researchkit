import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../cx";

export interface SkipLinkProps extends Omit<ComponentPropsWithRef<"a">, "href"> {
  /**
   * Id of the main content element. Give that element `tabIndex={-1}`
   * so focus moves to it, not just the scroll position.
   */
  targetId?: string;
  children?: ReactNode;
}

/** Lets keyboard and screen-reader users jump past repeated content. Render it first on the page. */
export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
  className,
  ...rest
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cx(
        "sr-only focus-ring",
        "focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-(--z-skip-link)",
        "focus:rounded-control focus:bg-background focus:px-4 focus:py-3 focus:text-foreground focus:shadow-overlay",
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
