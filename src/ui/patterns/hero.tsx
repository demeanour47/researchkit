import type { ReactNode } from "react";
import { cx } from "../cx";
import { PageContainer } from "../layout/page-container";
import { eyebrowClasses } from "../layout/section-header";

export interface HeroProps {
  /** Id of the page's single h1; the hero is labelled by it. */
  titleId: string;
  title: ReactNode;
  /** `home` for the landing page's display headline; `page` for every other page title. */
  size?: "home" | "page";
  /** `reading` aligns the hero with a reading-width page below it. */
  width?: "page" | "reading";
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Shown above the eyebrow, such as breadcrumbs. */
  before?: ReactNode;
  /** Calls to action. */
  actions?: ReactNode;
  /** Anything after the actions, such as badges, metadata or statistics. */
  children?: ReactNode;
}

/**
 * The top of a page: its single h1, what the page offers, and the main actions,
 * over a quiet backdrop that spans the page. Every page opens with one.
 */
export function Hero({ titleId, title, size = "page", width = "page", eyebrow, description, before, actions, children }: HeroProps) {
  const home = size === "home";
  return (
    <section aria-labelledby={titleId} className="relative isolate overflow-hidden border-b border-border">
      <HeroBackdrop />
      <PageContainer width={width} className={home ? "py-section md:py-section-wide" : "pt-8 pb-12 md:pt-10 md:pb-16"}>
        <div className={cx("grid gap-6", home && "justify-items-start")}>
          {before}
          <div className="grid gap-4">
            {eyebrow && <div className={eyebrowClasses}>{eyebrow}</div>}
            <h1
              id={titleId}
              className={cx("max-w-[22ch] font-display font-semibold text-balance", home ? "text-display-lg" : "text-title")}
            >
              {title}
            </h1>
            {description && <p className={cx("max-w-intro text-lead text-text-muted", home && "md:text-[1.3125rem]")}>{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          {children}
        </div>
      </PageContainer>
    </section>
  );
}

/** A faint grid fading out from the top, with a soft wash of the brand colour. Purely decorative. */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 print:hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60rem_28rem_at_50%_-10%,var(--color-action-soft),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] opacity-60 [background-size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
    </div>
  );
}
