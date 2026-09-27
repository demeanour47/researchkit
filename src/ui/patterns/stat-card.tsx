import type { ReactNode } from "react";
import { cx } from "../cx";
import { cardClasses } from "../primitives/card";
import { Icon, type IconName } from "../primitives/icon";

export interface StatCardProps {
  /** The figure, such as “22”. Only ever a real, verifiable count. */
  value: ReactNode;
  label: ReactNode;
  icon?: IconName;
  /** A short note under the label. */
  detail?: ReactNode;
  /** `compact` for a row of metrics inside other content. */
  compact?: boolean;
  as?: "li" | "div";
}

/**
 * A single figure with its label. The label comes first for assistive
 * technology, as a term and its value.
 */
export function StatCard({ value, label, icon, detail, compact = false, as: Element = "li" }: StatCardProps) {
  return (
    <Element className={cx(compact ? "grid gap-0.5" : cx(cardClasses({ padding: "sm" }), "grid gap-1"))}>
      <dl className="flex flex-col-reverse gap-1">
        <dt className="flex items-center gap-1.5 text-small text-text-muted">
          {icon && <Icon name={icon} />}
          {label}
        </dt>
        <dd className={cx("font-display font-semibold tracking-tight tabular-nums", compact ? "text-subheading" : "text-heading")}>{value}</dd>
      </dl>
      {detail && <p className="text-caption text-text-muted">{detail}</p>}
    </Element>
  );
}

/** A compact figure, for rows of metrics inside other content. */
export function MetricCard(props: Omit<StatCardProps, "compact">) {
  return <StatCard {...props} compact />;
}
