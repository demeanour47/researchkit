import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

export type VisuallyHiddenProps = ComponentPropsWithRef<"span">;

/** Text that screen readers announce but that is not shown on screen. */
export function VisuallyHidden({ className, ...rest }: VisuallyHiddenProps) {
  return <span className={cx("sr-only", className)} {...rest} />;
}
