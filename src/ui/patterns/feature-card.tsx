import type { ReactNode } from "react";
import { cx } from "../cx";
import { cardClasses } from "../primitives/card";
import type { IconName } from "../primitives/icon";
import { IconTile, type IconTileTone } from "../primitives/icon-tile";

export interface FeatureCardProps {
  icon: IconName;
  title: ReactNode;
  children: ReactNode;
  /** The heading's place in the outline. */
  level?: 3 | 4;
  tone?: IconTileTone;
  /** `li` when the card is one of a list. */
  as?: "li" | "div" | "article";
  className?: string;
}

/** A benefit or principle: an icon, a short title and a sentence or two. */
export function FeatureCard({ icon, title, children, level = 3, tone = "action", as: Element = "li", className }: FeatureCardProps) {
  const Heading = `h${level}` as const;
  return (
    <Element className={cx(cardClasses(), "grid content-start gap-4", className)}>
      <IconTile icon={icon} tone={tone} />
      <div className="grid gap-1.5">
        <Heading className="text-heading-sm font-semibold">{title}</Heading>
        <div className="text-small text-text-muted">{children}</div>
      </div>
    </Element>
  );
}
