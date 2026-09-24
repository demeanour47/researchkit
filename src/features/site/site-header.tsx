import type { ReactNode } from "react";
import { Link, PageContainer } from "@/ui";
import { MobileMenu } from "./mobile-menu";
import { PrimaryNav } from "./primary-nav";
import type { Brand, NavItem } from "./types";

export interface SiteHeaderProps {
  brand: Brand;
  navItems: readonly NavItem[];
  /** Controls shown at every screen size, such as a search entry point. */
  actions?: ReactNode;
  /** Visible label of the small-screen menu toggle. */
  menuLabel?: string;
}

/** The banner at the top of every page: brand, main navigation and optional actions. */
export function SiteHeader({ brand, navItems, actions, menuLabel }: SiteHeaderProps) {
  return (
    <header className="border-b border-foreground/15">
      <PageContainer className="relative flex min-h-16 items-center justify-between gap-6">
        <Link href={brand.href} variant="quiet" className="font-semibold">
          {brand.name}
        </Link>
        <div className="hidden md:block">
          <PrimaryNav items={navItems} />
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <div className="md:hidden">
            <MobileMenu label={menuLabel}>
              <PrimaryNav items={navItems} orientation="vertical" />
            </MobileMenu>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
