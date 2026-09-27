import type { ReactNode } from "react";
import { cx } from "../cx";
import { Badge } from "../primitives/badge";

export interface ComingSoonProps {
  title: ReactNode;
  description?: ReactNode;
  /** The id given to the description, for a heading or link to point at. */
  descriptionId?: string;
  level?: 3 | 4;
  /** The status label. */
  label?: string;
  as?: "li" | "div";
  className?: string;
}

/**
 * Something planned but not yet available. It is plain text, never a link, so
 * nothing leads to a page that doesn't exist; the dashed edge and the badge's
 * words, not colour, say it isn't ready.
 */
export function ComingSoon({ title, description, descriptionId, level = 3, label = "Coming soon", as: Element = "li", className }: ComingSoonProps) {
  const Heading = `h${level}` as const;
  return (
    <Element className={cx("grid content-start gap-2 rounded-panel border border-dashed border-border-strong bg-transparent p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <Heading className="text-heading-sm font-semibold text-text-muted">{title}</Heading>
        <Badge tone="outline" icon="hourglass" className="shrink-0">
          {label}
        </Badge>
      </div>
      {description && (
        <p id={descriptionId} className="text-small text-text-muted">
          {description}
        </p>
      )}
    </Element>
  );
}
