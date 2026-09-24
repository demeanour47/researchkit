import { Link } from "@/ui";

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
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} variant="quiet" className="text-text">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
