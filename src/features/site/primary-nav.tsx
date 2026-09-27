"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Icon, cx } from "@/ui";
import type { NavItem } from "./types";

type NavOrientation = "horizontal" | "vertical";

export interface PrimaryNavProps {
  items: readonly NavItem[];
  orientation?: NavOrientation;
  /** Accessible name of the navigation region. */
  label?: string;
}

/** Marks the exact page as `page`, and a section the reader is inside as `true`. */
function currentState(pathname: string, href: string): "page" | "true" | undefined {
  if (pathname === href) return "page";
  if (href !== "/" && pathname.startsWith(`${href}/`)) return "true";
  return undefined;
}

/**
 * The platform's main areas, with the current one announced to assistive
 * technology and marked by weight, a fill and an indicator bar together.
 */
export function PrimaryNav({ items, orientation = "horizontal", label = "Main" }: PrimaryNavProps) {
  const pathname = usePathname();
  const horizontal = orientation === "horizontal";

  return (
    <nav aria-label={label}>
      <ul className={cx("flex", horizontal ? "items-center gap-1" : "flex-col gap-1")}>
        {items.map((item) => (
          <li key={item.href} className="relative">
            <NextLink
              href={item.href}
              aria-current={currentState(pathname, item.href)}
              className={cx(
                "relative flex items-center gap-2 rounded-control font-medium text-text-muted focus-ring",
                "transition-[background-color,color] duration-(--duration-instant) ease-standard hover:bg-hover hover:text-text",
                "aria-[current]:bg-hover aria-[current]:font-semibold aria-[current]:text-text",
                horizontal
                  ? "min-h-control-sm px-3 text-small after:absolute after:inset-x-3 after:-bottom-[calc((var(--spacing-header)-var(--spacing-control-sm))/2)] after:h-0.5 after:rounded-pill after:bg-action after:opacity-0 aria-[current]:after:opacity-100"
                  : "min-h-control w-full px-3 aria-[current]:shadow-[inset_3px_0_0_var(--color-action)]",
              )}
            >
              {item.icon && <Icon name={item.icon} className={horizontal ? "size-4" : undefined} />}
              {item.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
