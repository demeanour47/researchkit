import type { ReactNode } from "react";
import { cx } from "../cx";

export interface ToolbarProps {
  /** Names the group of controls for assistive technology. */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * A row of related controls, such as search and filters, on one surface.
 * It is a labelled group, not an ARIA toolbar: each control keeps its own
 * keyboard behaviour and place in the tab order.
 */
export function Toolbar({ label, children, className }: ToolbarProps) {
  return (
    <div role="group" aria-label={label} className={cx("flex flex-wrap items-center gap-3 rounded-panel border border-border bg-surface p-3 shadow-card", className)}>
      {children}
    </div>
  );
}
