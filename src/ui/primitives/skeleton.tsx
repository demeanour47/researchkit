import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

/**
 * A placeholder in the shape of content that is still loading. Decorative:
 * pair it with a `LoadingIndicator` or other text that says what is loading.
 */
export function Skeleton({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return <div aria-hidden="true" className={cx("animate-shimmer rounded-control bg-secondary", className)} {...rest} />;
}
