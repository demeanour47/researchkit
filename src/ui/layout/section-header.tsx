import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../cx";

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

const headingSize: Record<HeadingLevel, string> = {
  2: "text-heading",
  3: "text-subheading",
  4: "text-heading-sm",
  5: "text-small",
  6: "text-small",
};

export interface SectionHeaderProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** Id for the heading. Pass the same value to `Section`'s `labelledBy`. */
  id: string;
  title: ReactNode;
  /** The heading's place in the page outline, not its visual size. */
  level?: HeadingLevel;
  /** A few words above the heading that name the area, such as “Workflow”. */
  eyebrow?: ReactNode;
  /** A sentence under the heading that says what the section offers. */
  description?: ReactNode;
  /** A short qualifier shown beside the heading, kept outside it. */
  note?: ReactNode;
  /** A related action, usually a standalone `Link`. */
  action?: ReactNode;
}

/** The small label above a heading. Shared, so every eyebrow looks the same. */
export const eyebrowClasses = "text-caption font-semibold tracking-[0.08em] text-action uppercase";

/** A section's heading, with an optional eyebrow, description, note and action. */
export function SectionHeader({ id, title, level = 2, eyebrow, description, note, action, className, ...rest }: SectionHeaderProps) {
  const Heading = `h${level}` as const;

  return (
    <div className={cx("mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)} {...rest}>
      <div className="grid max-w-intro gap-2">
        {eyebrow && <p className={eyebrowClasses}>{eyebrow}</p>}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Heading id={id} className={cx("font-display font-semibold text-balance", headingSize[level])}>
            {title}
          </Heading>
          {note && <p className="text-small text-text-muted">{note}</p>}
        </div>
        {description && <p className="text-text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
