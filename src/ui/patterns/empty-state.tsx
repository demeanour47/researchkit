import type { ReactNode } from "react";
import type { IconName } from "../primitives/icon";
import { IconTile } from "../primitives/icon-tile";

export interface EmptyStateProps {
  icon: IconName;
  title: ReactNode;
  /** What to do next. */
  children?: ReactNode;
  /** A way forward, such as a button to clear filters. */
  action?: ReactNode;
  level?: 2 | 3 | 4;
}

/** Shown where content would be but isn't yet, always with a way forward. */
export function EmptyState({ icon, title, children, action, level = 3 }: EmptyStateProps) {
  const Heading = `h${level}` as const;
  return (
    <div className="grid justify-items-center gap-4 rounded-panel border border-dashed border-border-strong px-6 py-12 text-center">
      <IconTile icon={icon} tone="neutral" size="lg" />
      <div className="grid max-w-intro gap-1">
        <Heading className="text-heading-sm font-semibold">{title}</Heading>
        {children && <div className="text-small text-text-muted">{children}</div>}
      </div>
      {action}
    </div>
  );
}
