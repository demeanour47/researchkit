import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

export interface ContentContainerProps extends ComponentPropsWithRef<"div"> {
  /** `reading` for prose; `intro` for the shorter lines under a heading. */
  measure?: "reading" | "intro";
}

/**
 * Prose at a comfortable line length, with the vertical rhythm between
 * paragraphs, lists and headings that long-form reading needs.
 */
export function ContentContainer({ measure = "reading", className, ...rest }: ContentContainerProps) {
  return <div className={cx("grid gap-4", measure === "reading" ? "max-w-reading" : "max-w-intro", className)} {...rest} />;
}
