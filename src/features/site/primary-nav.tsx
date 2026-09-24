"use client";

import { usePathname } from "next/navigation";
import { Link, cx } from "@/ui";
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

/** The platform's main areas, with the current one announced to assistive technology. */
export function PrimaryNav({ items, orientation = "horizontal", label = "Main" }: PrimaryNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className={cx("flex", orientation === "horizontal" ? "items-center gap-2" : "flex-col")}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              variant="quiet"
              aria-current={currentState(pathname, item.href)}
              className={cx(
                "flex min-h-control items-center px-2 [&[aria-current]]:font-semibold [&[aria-current]]:underline",
                orientation === "vertical" && "w-full",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
