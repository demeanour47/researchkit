import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

export interface DividerProps extends ComponentPropsWithRef<"hr"> {
  /** `decorative` dividers are hidden from assistive technology; others mark a thematic break. */
  decorative?: boolean;
}

/** A hairline between groups of content. */
export function Divider({ decorative = false, className, ...rest }: DividerProps) {
  return <hr aria-hidden={decorative || undefined} className={cx("border-0 border-t border-border", className)} {...rest} />;
}
