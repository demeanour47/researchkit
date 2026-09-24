import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

export type ButtonVariant = "primary" | "secondary" | "subtle";
export type ButtonSize = "md" | "sm";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Marks the button as working. It stays focusable and keeps its width,
   * but ignores activation and never submits a form while busy.
   */
  busy?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/85",
  secondary: "border border-foreground/60 hover:bg-foreground/5",
  subtle: "hover:bg-foreground/5",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-control px-4 text-base",
  sm: "min-h-control-sm px-3 text-sm",
};

/** The button appearance, shared with `ButtonLink` so both always look the same. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-control font-medium",
    "transition-colors duration-(--duration-instant) ease-standard focus-ring",
    variantClasses[variant],
    sizeClasses[size],
  );
}

/**
 * Performs an action on the current page. Use `Link` for navigation.
 * An icon-only button must be given an accessible name with `aria-label`.
 */
export function Button({
  variant = "primary",
  size = "md",
  busy = false,
  type = "button",
  onClick,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={busy ? "button" : type}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={busy ? undefined : onClick}
      className={cx(
        buttonClasses(variant, size),
        "disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress",
        className,
      )}
      {...rest}
    />
  );
}
