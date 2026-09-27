import type { ReactNode } from "react";
import { cx } from "../cx";
import { eyebrowClasses } from "../layout/section-header";
import { cardClasses } from "../primitives/card";
import { Icon, type IconName } from "../primitives/icon";
import { IconTile } from "../primitives/icon-tile";

export interface FeatureBannerProps {
  /** Id for the banner's heading, which names it. */
  titleId: string;
  title: ReactNode;
  icon: IconName;
  eyebrow?: ReactNode;
  description: ReactNode;
  /** Short statements of what it does, each shown with a check. */
  highlights?: readonly string[];
  actions?: ReactNode;
  /** A visual beside the words on wide screens, such as a figure or a list of steps. */
  media?: ReactNode;
  level?: 2 | 3;
}

/** The visual focus of a page: one item presented at length, with its highlights and actions. */
export function FeatureBanner({ titleId, title, icon, eyebrow, description, highlights = [], actions, media, level = 2 }: FeatureBannerProps) {
  const Heading = `h${level}` as const;
  return (
    <article aria-labelledby={titleId} className={cx(cardClasses({ padding: "none", tone: "raised" }), "overflow-hidden")}>
      <div aria-hidden="true" className="h-1 bg-[linear-gradient(90deg,var(--color-action),var(--color-accent))]" />
      <div className={cx("grid gap-10 p-6 sm:p-10", media !== undefined && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center")}>
        <div className="grid content-start gap-6">
          <div className="flex items-center gap-3">
            <IconTile icon={icon} size="lg" />
            {eyebrow && <p className={eyebrowClasses}>{eyebrow}</p>}
          </div>
          <div className="grid gap-3">
            <Heading id={titleId} className="font-display text-heading font-semibold text-balance">
              {title}
            </Heading>
            <p className="max-w-intro text-lead text-text-muted">{description}</p>
          </div>
          {highlights.length > 0 && (
            <ul className="grid gap-2.5">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <Icon name="circle-check" className="mt-[0.3em] text-success" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {media && <div className="min-w-0">{media}</div>}
      </div>
    </article>
  );
}
