import { useId, type ReactNode } from "react";
import { Link, PageContainer } from "@/ui";
import type { NavGroup } from "./types";

export interface SiteFooterProps {
  groups: readonly NavGroup[];
  /** Accessible name of the footer's navigation region. */
  navLabel?: string;
  /** Closing content below the link groups, such as a tagline or legal line. */
  children?: ReactNode;
}

/** The complete map of the platform, present on every page. */
export function SiteFooter({ groups, navLabel = "Site", children }: SiteFooterProps) {
  const idPrefix = useId();

  return (
    <footer className="border-t border-foreground/15 py-section-compact">
      <PageContainer className="grid gap-8">
        <nav aria-label={navLabel}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
            {groups.map((group, index) => {
              const headingId = `${idPrefix}-${index}`;
              return (
                <div key={group.heading}>
                  <h2 id={headingId} className="mb-2 text-sm font-semibold">
                    {group.heading}
                  </h2>
                  <ul aria-labelledby={headingId}>
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          variant="quiet"
                          className="inline-flex min-h-8 items-center text-sm"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </nav>
        {children && <div className="text-sm">{children}</div>}
      </PageContainer>
    </footer>
  );
}
