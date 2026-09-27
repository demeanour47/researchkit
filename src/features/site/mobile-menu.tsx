"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/ui";

export interface MobileMenuProps {
  /** Visible label of the toggle. */
  label?: string;
  children: ReactNode;
}

/**
 * A disclosure that shows and hides navigation on small screens.
 * Built on the native disclosure element, so it opens and closes without scripts;
 * scripts add closing with Escape and after navigation.
 */
export function MobileMenu({ label = "Menu", children }: MobileMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    detailsRef.current?.removeAttribute("open");
  }, [pathname]);

  function handleKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
    const details = detailsRef.current;
    if (event.key !== "Escape" || !details?.open) return;
    details.open = false;
    details.querySelector("summary")?.focus();
  }

  return (
    <details ref={detailsRef} onKeyDown={handleKeyDown} className="group">
      <summary className="flex min-h-control-sm cursor-pointer list-none items-center gap-2 rounded-control border border-border bg-surface px-3 text-small font-medium shadow-card focus-ring hover:bg-hover [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">
          <Icon name="menu" />
        </span>
        <span className="hidden group-open:inline">
          <Icon name="close" />
        </span>
        {label}
      </summary>
      <div className="absolute inset-x-0 top-full z-(--z-overlay) grid max-h-[calc(100dvh-var(--spacing-header))] gap-4 overflow-y-auto border-b border-border bg-raised px-gutter py-4 shadow-overlay group-open:animate-rise-in">
        {children}
      </div>
    </details>
  );
}
