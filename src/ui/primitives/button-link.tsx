import NextLink from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../cx";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button";
import { Icon, type IconName } from "./icon";

export interface ButtonLinkProps extends Omit<ComponentPropsWithRef<"a">, "href"> {
  /** An address within the site. */
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** An icon after the label, such as an arrow for “continue”. */
  trailingIcon?: IconName;
  children: ReactNode;
}

/**
 * Navigation that looks like a button, for calls to action.
 * It is a link, so it behaves like one: it navigates, and can be opened in a new tab.
 */
export function ButtonLink({ href, variant = "primary", size = "md", trailingIcon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <NextLink href={href} className={cx(buttonClasses(variant, size), "group/button", className)} {...rest}>
      {children}
      {trailingIcon && (
        <Icon name={trailingIcon} className="transition-transform duration-(--duration-quick) ease-standard group-hover/button:translate-x-0.5" />
      )}
    </NextLink>
  );
}
