import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";
import { Icon } from "./icon";

export interface LoadingIndicatorProps extends ComponentPropsWithRef<"p"> {
  /** What is loading, announced politely, e.g. “Loading the chart”. */
  label: string;
}

/** A spinner with words, announced to assistive technology when it appears. */
export function LoadingIndicator({ label, className, ...rest }: LoadingIndicatorProps) {
  return (
    <p role="status" className={cx("inline-flex items-center gap-2 text-small text-text-muted", className)} {...rest}>
      <Icon name="loader" className="animate-spin text-action" />
      {label}
    </p>
  );
}
