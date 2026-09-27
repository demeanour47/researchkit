import NextLink from "next/link";
import { Icon } from "@/ui";

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page, which is the last item. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  /** Accessible name of the navigation region. */
  label?: string;
}

/** Where the current page sits: each level links up, and the current page is marked as such. */
export function Breadcrumbs({ items, label = "Breadcrumb" }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className="print:hidden">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-small text-text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex min-w-0 items-center gap-1.5">
            {index > 0 && <Icon name="chevron-right" className="text-[0.85em] opacity-60" />}
            {item.href ? (
              <NextLink
                href={item.href}
                className="inline-flex min-h-6 items-center gap-1 rounded-sm underline-offset-4 transition-colors duration-(--duration-instant) hover:text-text hover:underline focus-ring"
              >
                {index === 0 && <Icon name="home" />}
                {item.label}
              </NextLink>
            ) : (
              <span aria-current="page" className="truncate font-medium text-text">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
