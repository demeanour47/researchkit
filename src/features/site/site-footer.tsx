import { useId, type ReactNode } from "react";
import { Link, PageContainer } from "@/ui";
import { BrandMark } from "./brand-link";
import type { NavGroup } from "./types";

export interface SiteFooterProps {
  groups: readonly NavGroup[];
  /** The product name and a sentence about it, beside the links. */
  about?: { name: string; text: string };
  /** Accessible name of the footer's navigation region. */
  navLabel?: string;
  /** Closing content below the link groups, such as the version or a legal line. */
  children?: ReactNode;
}

/** The complete map of the platform, present on every page. */
export function SiteFooter({ groups, about, navLabel = "Site", children }: SiteFooterProps) {
  const idPrefix = useId();

  return (
    <footer className="border-t border-border bg-sunken py-section-compact md:py-16">
      <PageContainer className="grid gap-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {about && (
            <div className="grid max-w-xs content-start gap-3">
              <p className="flex items-center gap-2.5 font-semibold tracking-tight">
                <BrandMark />
                {about.name}
              </p>
              <p className="text-small text-text-muted">{about.text}</p>
            </div>
          )}
          <nav aria-label={navLabel}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
              {groups.map((group, index) => {
                const headingId = `${idPrefix}-${index}`;
                return (
                  <div key={group.heading}>
                    <h2 id={headingId} className="mb-3 text-small font-semibold">
                      {group.heading}
                    </h2>
                    <ul aria-labelledby={headingId} className="grid gap-1">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} variant="quiet" className="inline-flex min-h-8 items-center text-small text-text-muted hover:text-text">
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
        </div>
        {children && <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-small text-text-muted">{children}</div>}
      </PageContainer>
    </footer>
  );
}
