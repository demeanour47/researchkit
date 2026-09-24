import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

type SectionSpacing = "standard" | "compact";

export interface SectionProps extends ComponentPropsWithRef<"section"> {
  /** Id of the heading that names this section, so assistive technology announces it by name. */
  labelledBy: string;
  spacing?: SectionSpacing;
}

/** A named region of a page with consistent vertical rhythm. */
export function Section({ labelledBy, spacing = "standard", className, ...rest }: SectionProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cx(
        spacing === "compact" ? "py-section-compact" : "py-section md:py-section-wide",
        className,
      )}
      {...rest}
    />
  );
}
