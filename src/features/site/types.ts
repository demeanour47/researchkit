import type { IconName } from "@/ui";

export interface NavItem {
  label: string;
  href: string;
  /** A decorative icon beside the label. */
  icon?: IconName;
}

export interface NavGroup {
  heading: string;
  items: readonly NavItem[];
}

export interface Brand {
  name: string;
  href: string;
  /** A short label beside the name, such as the version. */
  badge?: string;
  /** How the badge is announced, such as “Version 0.1.0”. */
  badgeLabel?: string;
}
