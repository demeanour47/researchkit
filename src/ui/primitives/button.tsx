import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";
import { Icon } from "./icon";

/**
 * `primary` for the one main action in a view; `secondary` for other actions;
 * `outline` for actions beside a primary one that need less weight; `ghost`
 * for actions inside toolbars and lists; `danger` for actions that remove work.
 * `subtle` is the earlier name for `ghost`.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Marks the button as working. It stays focusable and keeps its width,
   * but ignores activation and never submits a form while busy.
   */
  busy?: boolean;
}

const variantClasses: Record<Exclude<ButtonVariant, "subtle">, string> = {
  primary:
    "bg-action text-on-action shadow-card hover:bg-action-hover active:bg-action-hover",
  secondary:
    "border border-border-strong bg-surface text-text shadow-card hover:border-border-control hover:bg-hover",
  outline: "border border-border-control text-text hover:bg-hover",
  ghost: "text-text hover:bg-hover",
  danger: "bg-danger text-on-action shadow-card hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-control-sm gap-1.5 px-3 text-sm",
  md: "min-h-control gap-2 px-4 text-base",
  lg: "min-h-12 gap-2 px-6 text-base",
};

/** Square buttons for a single icon, at each size. */
const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "size-control-sm [&>svg]:size-4",
  md: "size-control [&>svg]:size-5",
  lg: "size-12 [&>svg]:size-5",
};

/** The button appearance, shared with `ButtonLink` and `IconButton` so they always look the same. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", iconOnly = false): string {
  return cx(
    "relative inline-flex shrink-0 select-none items-center justify-center rounded-control font-medium whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-(--duration-instant) ease-standard",
    "focus-ring active:translate-y-px",
    variantClasses[variant === "subtle" ? "ghost" : variant],
    iconOnly ? iconSizeClasses[size] : sizeClasses[size],
  );
}

/** The shared disabled and busy states of every button. */
export const buttonStateClasses =
  "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress";

/** Shown in place of nothing while a button is busy, so its width barely changes. */
export function BusyIndicator() {
  return <Icon name="loader" className="animate-spin" />;
}

/**
 * Performs an action on the current page. Use `Link` or `ButtonLink` for navigation,
 * and `IconButton` for a button that shows only an icon.
 */
export function Button({
  variant = "primary",
  size = "md",
  busy = false,
  type = "button",
  onClick,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={busy ? "button" : type}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={busy ? undefined : onClick}
      className={cx(buttonClasses(variant, size), buttonStateClasses, className)}
      {...rest}
    >
      {busy && <BusyIndicator />}
      {children}
    </button>
  );
}
