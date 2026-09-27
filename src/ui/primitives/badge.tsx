import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";
import { Icon, type IconName } from "./icon";

/**
 * Visual emphasis only; the badge's words carry its meaning.
 * `caution` always adds an alert icon, so it never relies on colour.
 */
export type BadgeTone = "neutral" | "info" | "accent" | "success" | "caution" | "danger" | "outline";

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  tone?: BadgeTone;
  /** A decorative icon before the words. */
  icon?: IconName;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-secondary text-text",
  info: "bg-action-soft text-action",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  caution: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  outline: "border border-border-strong text-text-muted",
};

/** A short, non-interactive label that gives context, such as a status. */
export function Badge({ tone = "neutral", icon, className, children, ...rest }: BadgeProps) {
  const shownIcon = icon ?? (tone === "caution" ? "alert" : undefined);
  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center gap-1 rounded-pill px-2.5 py-0.5 text-caption font-medium leading-5",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {shownIcon && <Icon name={shownIcon} className="text-[0.95em]" />}
      {children}
    </span>
  );
}
