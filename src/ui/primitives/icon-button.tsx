import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";
import { buttonClasses, buttonStateClasses, type ButtonSize, type ButtonVariant } from "./button";
import { Icon, type IconName } from "./icon";

export interface IconButtonProps extends Omit<ComponentPropsWithRef<"button">, "children" | "aria-label"> {
  icon: IconName;
  /** The accessible name, also shown as a tooltip. Required, since there is no visible text. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A square button showing only an icon. Its label is announced and shown on hover. */
export function IconButton({ icon, label, variant = "ghost", size = "md", type = "button", className, ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={label} className={cx(buttonClasses(variant, size, true), buttonStateClasses, className)} {...rest}>
      <Icon name={icon} />
    </button>
  );
}
