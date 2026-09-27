import NextLink from "next/link";
import type { ReactNode } from "react";
import { cx } from "../cx";
import { cardClasses, coverLinkClasses } from "../primitives/card";
import { Icon, type IconName } from "../primitives/icon";
import { IconTile, type IconTileTone } from "../primitives/icon-tile";

export interface QuickActionProps {
  href: string;
  icon: IconName;
  title: ReactNode;
  description?: ReactNode;
  tone?: IconTileTone;
  level?: 3 | 4;
  as?: "li" | "div";
}

/** A compact, fully clickable shortcut to a place: icon, title, a line of context and an arrow. */
export function QuickAction({ href, icon, title, description, tone = "action", level = 3, as: Element = "li" }: QuickActionProps) {
  const Heading = `h${level}` as const;
  return (
    <Element className={cx(cardClasses({ interactive: true, padding: "sm" }), "group flex items-center gap-4")}>
      <IconTile icon={icon} tone={tone} />
      <div className="grid min-w-0 flex-1 gap-0.5">
        <Heading className="text-heading-sm font-semibold">
          <NextLink href={href} className={coverLinkClasses}>
            {title}
          </NextLink>
        </Heading>
        {description && <p className="text-small text-text-muted">{description}</p>}
      </div>
      <Icon name="arrow-right" className="text-text-muted transition-transform duration-(--duration-quick) ease-standard group-hover:translate-x-0.5 group-hover:text-action" />
    </Element>
  );
}
