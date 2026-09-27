import type { ReactNode } from "react";
import { PageContainer } from "@/ui";
import { BrandLink } from "./brand-link";
import { MobileMenu } from "./mobile-menu";
import { PrimaryNav } from "./primary-nav";
import type { Brand, NavItem } from "./types";

export interface SiteHeaderProps {
  brand: Brand;
  navItems: readonly NavItem[];
  /** Controls shown at every screen size, such as search. */
  actions?: ReactNode;
  /** Controls shown beside the actions on wide screens, and in the menu below that, such as the theme switcher. */
  secondaryActions?: ReactNode;
  /** The same controls, laid out for the small-screen menu. */
  menuActions?: ReactNode;
  /** Visible label of the small-screen menu toggle. */
  menuLabel?: string;
}

/**
 * The banner at the top of every page: brand, main navigation and actions.
 * It stays in view while the page scrolls, over a translucent backdrop.
 */
export function SiteHeader({ brand, navItems, actions, secondaryActions, menuActions, menuLabel }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-(--z-sticky) border-b border-border bg-canvas/80 backdrop-blur-md print:static print:bg-canvas">
      <PageContainer className="relative flex h-header items-center gap-4">
        <BrandLink brand={brand} />
        <div className="ms-4 hidden lg:block print:hidden">
          <PrimaryNav items={navItems} />
        </div>
        <div className="ms-auto flex items-center gap-2 print:hidden">
          {actions}
          {secondaryActions && <div className="hidden items-center gap-2 lg:flex">{secondaryActions}</div>}
          <div className="lg:hidden">
            <MobileMenu label={menuLabel}>
              <PrimaryNav items={navItems} orientation="vertical" />
              {menuActions && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">{menuActions}</div>}
            </MobileMenu>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
