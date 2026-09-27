import type { ReactNode } from "react";
import { cx } from "../cx";
import { Icon, type IconName } from "../primitives/icon";

export type CalloutTone = "note" | "info" | "success" | "caution" | "danger";

const tones: Record<CalloutTone, { icon: IconName; classes: string; iconClasses: string }> = {
  note: { icon: "lightbulb", classes: "border-border bg-sunken", iconClasses: "text-text-muted" },
  info: { icon: "info", classes: "border-action/30 bg-action-soft", iconClasses: "text-action" },
  success: { icon: "circle-check", classes: "border-success/30 bg-success-soft", iconClasses: "text-success" },
  caution: { icon: "alert", classes: "border-warning/30 bg-warning-soft", iconClasses: "text-warning" },
  danger: { icon: "alert", classes: "border-danger/30 bg-danger-soft", iconClasses: "text-danger" },
};

export interface CalloutProps {
  tone?: CalloutTone;
  /** A short title in bold; the tone's meaning must also be in these words, not only the colour. */
  title?: ReactNode;
  children: ReactNode;
  icon?: IconName;
  className?: string;
}

/** A note set apart from the text around it, such as a limitation or a tip. */
export function Callout({ tone = "note", title, children, icon, className }: CalloutProps) {
  const style = tones[tone];
  return (
    <div className={cx("flex gap-3 rounded-panel border p-4", style.classes, className)}>
      <Icon name={icon ?? style.icon} className={cx("mt-[0.3em]", style.iconClasses)} />
      <div className="grid gap-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-small">{children}</div>
      </div>
    </div>
  );
}
