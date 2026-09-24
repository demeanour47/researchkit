import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../cx";

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

const headingSize: Record<HeadingLevel, string> = {
  2: "text-heading",
  3: "text-subheading",
  4: "text-body",
  5: "text-small",
  6: "text-small",
};

export interface SectionHeaderProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** Id for the heading. Pass the same value to `Section`'s `labelledBy`. */
  id: string;
  title: ReactNode;
  /** The heading's place in the page outline, not its visual size. */
  level?: HeadingLevel;
  /** A short qualifier shown beside the heading, kept outside it. */
  note?: ReactNode;
  /** A related action, usually a standalone `Link`. */
  action?: ReactNode;
}

/** A section's heading, with an optional note and action. */
export function SectionHeader({
  id,
  title,
  level = 2,
  note,
  action,
  className,
  ...rest
}: SectionHeaderProps) {
  const Heading = `h${level}` as const;

  return (
    <div
      className={cx("mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2", className)}
      {...rest}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading id={id} className={cx("font-semibold text-balance", headingSize[level])}>
          {title}
        </Heading>
        {note && <p className="text-sm text-foreground/75">{note}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
