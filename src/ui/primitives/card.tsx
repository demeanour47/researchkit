import type { ComponentPropsWithRef, ElementType } from "react";
import { cx } from "../cx";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardStyle {
  /**
   * For cards that contain one link covering the whole card (see `coverLinkClasses`).
   * The card lifts under the pointer and shows the focus ring when its link is focused.
   */
  interactive?: boolean;
  padding?: CardPadding;
  /** `raised` for cards that should stand out from neighbouring cards, such as a featured item. */
  tone?: "default" | "raised" | "sunken";
}

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-6 sm:p-8",
};

const toneClasses = {
  default: "bg-surface",
  raised: "bg-raised shadow-raised",
  sunken: "bg-sunken",
} as const;

/** The surface every card is built on: one border, radius, padding and hover lift for all. */
export function cardClasses({ interactive = false, padding = "md", tone = "default" }: CardStyle = {}): string {
  return cx(
    "relative rounded-panel border border-border",
    tone !== "sunken" && "shadow-card",
    toneClasses[tone],
    paddingClasses[padding],
    interactive &&
      cx(
        "transition-[border-color,box-shadow,transform] duration-(--duration-quick) ease-standard",
        "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift",
        "has-[a:focus-visible]:border-border-strong has-[a:focus-visible]:shadow-lift",
      ),
  );
}

/**
 * Classes for the one link that makes a whole card clickable. The link stays the
 * accessible element; a pseudo-element stretches its hit area over the card,
 * and the focus ring is drawn around the card rather than the words.
 */
export const coverLinkClasses = cx(
  "outline-none after:absolute after:inset-0 after:rounded-panel after:content-['']",
  "focus-visible:after:outline-(length:--focus-ring-width) focus-visible:after:outline-offset-(length:--focus-ring-offset) focus-visible:after:outline-focus focus-visible:after:outline-solid",
);

type CardProps<T extends ElementType> = CardStyle & { as?: T } & Omit<ComponentPropsWithRef<T>, "as">;

/** A bordered surface for grouped content. Use `as` for the right element: `li` in lists, `article` for self-contained items. */
export function Card<T extends ElementType = "div">({ as, interactive, padding, tone, className, ...rest }: CardProps<T>) {
  const Element: ElementType = as ?? "div";
  return <Element className={cx(cardClasses({ interactive, padding, tone }), className)} {...rest} />;
}
