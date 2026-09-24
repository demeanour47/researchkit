import NextLink from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../cx";
import { Icon } from "./icon";
import { VisuallyHidden } from "./visually-hidden";

type LinkVariant = "inline" | "standalone" | "quiet";

export interface LinkProps extends Omit<ComponentPropsWithRef<"a">, "href"> {
  href: string;
  /**
   * `inline` for links inside running text (always underlined),
   * `standalone` for links that stand alone and carry an arrow,
   * `quiet` for grouped link lists only, where context makes them identifiable as links.
   */
  variant?: LinkVariant;
  /** Announced after the label when the link leaves the site. */
  externalLabel?: string;
  children: ReactNode;
}

const variantClasses: Record<LinkVariant, string> = {
  inline: "underline decoration-1 underline-offset-4 hover:decoration-2",
  standalone:
    "inline-flex min-h-6 items-center gap-1 font-medium underline-offset-4 hover:underline",
  quiet: "underline-offset-4 hover:underline",
};

const isWebAddress = (href: string) => /^(https?:)?\/\//i.test(href);
const hasScheme = (href: string) => /^[a-z][a-z\d+.-]*:/i.test(href);

/** Navigates to another page or place. Use `Button` for actions on the current page. */
export function Link({
  href,
  variant = "inline",
  externalLabel = "(external link)",
  className,
  children,
  ...rest
}: LinkProps) {
  const external = isWebAddress(href);
  const classes = cx("rounded-sm focus-ring", variantClasses[variant], className);

  const content = (
    <>
      {children}
      {external ? (
        <>
          <Icon name="external-link" className="ms-1" />
          <VisuallyHidden> {externalLabel}</VisuallyHidden>
        </>
      ) : (
        variant === "standalone" && <Icon name="arrow-right" />
      )}
    </>
  );

  if (external || hasScheme(href) || href.startsWith("#")) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <NextLink href={href} className={classes} {...rest}>
      {content}
    </NextLink>
  );
}
