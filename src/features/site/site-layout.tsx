import type { ReactNode } from "react";
import { SkipLink } from "@/ui";

export interface SiteLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  /** Id given to the main content, and the skip link's target. */
  mainId?: string;
  skipLinkLabel?: string;
}

/**
 * The page frame: skip link, header, main content and footer, in that order.
 * The skip link is the first focusable element; the main region receives its focus.
 */
export function SiteLayout({
  header,
  footer,
  children,
  mainId = "main-content",
  skipLinkLabel,
}: SiteLayoutProps) {
  return (
    <div className="flex min-h-full flex-col">
      <SkipLink targetId={mainId}>{skipLinkLabel}</SkipLink>
      {header}
      <main id={mainId} tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      {footer}
    </div>
  );
}
