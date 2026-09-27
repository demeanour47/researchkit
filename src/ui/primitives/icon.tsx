import { createElement, type ComponentPropsWithRef } from "react";
import { ICONS, type IconName } from "../design/icons";
import { cx } from "../cx";

export type { IconName };

export interface IconProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  name: IconName;
  /** Accessible name. Omit for decorative icons, which are hidden from assistive technology. */
  label?: string;
}

/** A symbol from the icon set, sized to the surrounding text and drawn in its colour. */
export function Icon({ name, label, className, ...rest }: IconProps) {
  const a11y = label ? ({ role: "img", "aria-label": label } as const) : ({ "aria-hidden": true } as const);

  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={cx("inline-block shrink-0 align-[-0.125em]", className)}
      {...a11y}
      {...rest}
    >
      {ICONS[name].map(([tag, attributes], index) => createElement(tag, { key: index, ...attributes }))}
    </svg>
  );
}
