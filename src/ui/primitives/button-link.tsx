import NextLink from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../cx";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button";

export interface ButtonLinkProps extends Omit<ComponentPropsWithRef<"a">, "href"> {
  /** An address within the site. */
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/**
 * Navigation that looks like a button, for calls to action.
 * It is a link, so it behaves like one: it navigates, and can be opened in a new tab.
 */
export function ButtonLink({ href, variant = "primary", size = "md", className, ...rest }: ButtonLinkProps) {
  return <NextLink href={href} className={cx(buttonClasses(variant, size), className)} {...rest} />;
}
