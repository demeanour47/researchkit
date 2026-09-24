import type { ComponentPropsWithRef } from "react";
import { cx } from "../cx";

/** The curated icon set: 24×24 line drawings, one path per stroke. */
const icons = {
  "arrow-right": ["M5 12h14", "M13 6l6 6-6 6"],
  "external-link": [
    "M14 4h6v6",
    "M20 4l-9 9",
    "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  ],
  check: ["M5 12.5l4.5 4.5L19 7"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  search: ["M11 4.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13", "M16 16l4.5 4.5"],
  copy: [
    "M10 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z",
    "M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3",
  ],
  alert: ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", "M12 7.5v5.5", "M12 16.5v.01"],
  info: ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", "M12 11v5.5", "M12 7.5v.01"],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof icons;

export interface IconProps
  extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  name: IconName;
  /** Accessible name. Omit for decorative icons, which are hidden from assistive technology. */
  label?: string;
}

/** A symbol from the icon set, sized to the surrounding text and drawn in its colour. */
export function Icon({ name, label, className, ...rest }: IconProps) {
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

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
      {icons[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
