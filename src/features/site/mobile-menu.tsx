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
      <summary className="flex min-h-control cursor-pointer list-none items-center gap-2 rounded-control px-3 font-medium focus-ring hover:bg-foreground/5 [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">
          <Icon name="menu" />
        </span>
        <span className="hidden group-open:inline">
          <Icon name="close" />
        </span>
        {label}
      </summary>
      <div className="absolute inset-x-0 top-full z-(--z-overlay) border-b border-foreground/15 bg-background px-gutter py-3 shadow-raised">
        {children}
      </div>
    </details>
  );
}
